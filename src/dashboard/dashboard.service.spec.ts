// src/dashboard/dashboard.service.memory.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ContextIdFactory } from '@nestjs/core';
import { DashBoardService } from './dashboard.service';

import { MongoConnectionService } from '../database/mongoconnection.service';
import { PrometheusService } from '../prometheus/prometheus.service';
import {
  CustomLoggerService,
  CustomSingletonLoggerService,
  ApplicationInsightsService,
  EncryptionService,
} from '@eqxjs/stub';
import { UtilsService } from '../utils/utils.services';

import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, ObjectId } from 'mongodb';

// ✅ Use require to avoid "namespace import is not callable" in Jest
const dayjs = require('dayjs') as typeof import('dayjs');
const utc = require('dayjs/plugin/utc');
const tz = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(tz);

// ---- Types (include _id and ts because the service returns raw Mongo docs)
export class DashBoardResponse {
  _id?: ObjectId;
  ts?: Date;
  userData!: UserData;
  userFeedback!: UserFeedBack;
}
export type UserData = {
  myId: string;
  device: string[];
  public: string;
  username: string;
};
export type UserFeedBack = {
  rating?: number;
  comment?: string;
  [key: string]: any;
};

type UserRatingDoc = DashBoardResponse & { _id?: ObjectId; ts: Date };

describe('DashBoardService (integration-ish with mongodb-memory-server)', () => {
  let moduleRef: TestingModule;
  let mongod: MongoMemoryServer;
  let client: MongoClient;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    client = await MongoClient.connect(mongod.getUri(), {});
  });

  afterAll(async () => {
    await client?.close();
    await mongod?.stop();
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock config to match how the service reads it:
    // databaseConfig.survey[0].listCollectionMongo.collectionName
    jest.spyOn(UtilsService, 'getDBConfig').mockReturnValue({
      survey: [
        {
          mongoUrl: mongod.getUri(),
          listCollectionMongo: {
            key: 'userRating',
            name: 'userRating',
            service: 'userRating',
            cmdName: 'userRating',
            endpointName: 'userRating',
            collectionName: 'user_ratings',
          },
        },
      ],
      userRating: { collectionName: 'user_ratings' },
    } as any);

    // Seed current-month data (Asia/Bangkok)
    const db = client.db('fake-db');
    const coll = db.collection<UserRatingDoc>('user_ratings');
    await coll.deleteMany({});

    const startDate = dayjs().tz('Asia/Bangkok').startOf('month').toDate();

    // Let Mongo assign _id automatically (no _id in docs)
    await coll.insertMany([
      {
        ts: dayjs(startDate).add(1, 'day').toDate(),
        userData: {
          myId: '0934025114',
          device: ['fadbbc52ac111a8d'],
          public: '0934025114',
          username: 'USER 0110',
        },
        userFeedback: { rating: 5, comment: 'good' },
      },
      {
        ts: dayjs(startDate).add(2, 'day').toDate(),
        userData: {
          myId: '0934025115',
          device: ['abc123xyz'],
          public: '0934025115',
          username: 'USER 0111',
        },
        userFeedback: { rating: 4 },
      },
      // outside the month to prove filter works
      {
        ts: dayjs(startDate).subtract(1, 'month').toDate(),
        userData: {
          myId: 'old-month',
          device: ['device-old'],
          public: 'old-month',
          username: 'USER OLD',
        },
        userFeedback: { rating: 1 },
      },
    ]);

    // Chainable logger stub for setDependencyMetadata(...).debug(...)
    const loggerMock = {
      setDependencyMetadata: jest.fn().mockReturnValue({
        debug: jest.fn().mockReturnThis(),
      }),
      debug: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    moduleRef = await Test.createTestingModule({
      providers: [
        DashBoardService,
        MongoConnectionService,
        { provide: CustomSingletonLoggerService, useValue: { log: jest.fn(), error: jest.fn() } },
        { provide: PrometheusService, useValue: { databaseRequest: jest.fn(), databaseResponse: jest.fn() } },
        { provide: CustomLoggerService, useValue: loggerMock },
        {
          provide: ApplicationInsightsService,
          useValue: {
            trackEvent: jest.fn(),
            trackException: jest.fn(),
            trackDependency: jest.fn(),
            trackRequest: jest.fn(),
            flush: jest.fn(),
          },
        },
        { provide: EncryptionService, useValue: { encrypt: jest.fn(), decrypt: jest.fn() } },
      ],
    }).compile();

    // Return a real driver-like connection; defensive default for collection name
    const mongoConnSvc = moduleRef.get(MongoConnectionService);
    const dbLike = client.db('fake-db');
    jest.spyOn(mongoConnSvc as any, 'getConnection').mockImplementation((_key: string) => {
      return {
        db: { namespace: 'fake-db' },
        collection: (name?: string) => dbLike.collection(name || 'user_ratings'),
      };
    });
  });

  it('getUserRating returns only current-month docs with pagination and correct shape', async () => {
    const contextId = ContextIdFactory.create();
    await moduleRef.registerRequestByContextId({ headers: {} }, contextId);
    const service = await moduleRef.resolve(DashBoardService, contextId);

    const dtoPage1 = { page: 1, limit: 1, service: 'userRating' } as any;
    const dtoPage2 = { page: 2, limit: 1, service: 'userRating' } as any;

    const startDate = dayjs().tz('Asia/Bangkok').startOf('month').toDate();
    const endDate = dayjs(startDate).add(1, 'month').toDate();

    const page1 = await service.getUserRating(dtoPage1);
    expect(page1).toHaveLength(1);
    expect(page1[0]._id).toBeDefined();
    expect(page1[0].ts && new Date(page1[0].ts) >= startDate && new Date(page1[0].ts) < endDate).toBe(true);
    expect(page1[0].userData).toBeDefined();
    expect(Array.isArray(page1[0].userData.device)).toBe(true);

    const page2 = await service.getUserRating(dtoPage2);
    expect(page2).toHaveLength(1);
    expect(page2[0]._id).toBeDefined();
    expect(page2[0].ts && new Date(page2[0].ts) >= startDate && new Date(page2[0].ts) < endDate).toBe(true);

    // different docs across pages
    expect(page1[0]._id?.toString()).not.toEqual(page2[0]._id?.toString());

    // optional: ts desc (page1 newer/equal than page2)
    expect(new Date(page1[0].ts!) >= new Date(page2[0].ts!)).toBe(true);
  });
});
