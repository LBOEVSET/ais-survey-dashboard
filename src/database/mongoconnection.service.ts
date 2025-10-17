import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InternalServerError } from '@eqxjs/stub';
import { UtilsService } from '../utils/utils.services';

@Injectable()
export class MongoConnectionService implements OnModuleInit {
  private connections: Record<string, Connection> = {};
  private readonly readyPromise: Promise<void>;
  private readyResolve!: () => void;

  // only these keys in databaseConfig should become mongoose connections
  private static readonly SECTIONS = new Set(['master', 'profile', 'language', 'survey']);

  constructor(private readonly moduleRef: ModuleRef) {
    this.readyPromise = new Promise((resolve) => (this.readyResolve = resolve));
  }

  async onModuleInit() {
    const dbConfig = UtilsService.getDBConfig();

    for (const [type, cfg] of Object.entries(dbConfig ?? {})) {
      // ✅ ignore scalar keys like mongo_username, mongo_password, mongo_host
      if (!MongoConnectionService.SECTIONS.has(type)) continue;

      if (Array.isArray(cfg)) {
        // e.g. survey: [{ mongoUrl, ... }, { ... }]
        await Promise.all(cfg.map((_, index) => this.registerConnection(`${type}_${index}`)));
      } else {
        // if you ever use single-object form
        await this.registerConnection(type);
      }
    }

    this.readyResolve();
  }

  private async registerConnection(connectionName: string) {
    try {
      // get the connection provider that MongooseModule.forRoot/forRootAsync created
      const token = getConnectionToken(connectionName);
      const connection = this.moduleRef.get<Connection>(token, { strict: false });

      if (!connection) {
        throw new Error(`Connection provider "${token}" not found`);
      }

      this.connections[connectionName] = connection;
    } catch (err) {
      throw new InternalServerError(
        `Failed to connect to MongoDB with connection name ${connectionName}`,
      );
    }
  }

  getConnection(name: string): Connection {
    return this.connections[name];
  }

  waitUntilReady(): Promise<void> {
    return this.readyPromise;
  }
}
