// src/dashboard/dashboard.service.memory.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ContextIdFactory } from '@nestjs/core';
import { AuthenticationService } from '../../src/authentication/authentication.service';
import { PrometheusService } from '../../src/prometheus/prometheus.service';
import {
  CustomLoggerService,
  CustomSingletonLoggerService,
  ApplicationInsightsService,
  EncryptionService,
} from '@eqxjs/stub';
import { SignInDto } from '../../src/authentication/dtos/signin.dto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { JwtModule } from '@nestjs/jwt';

const dayjs = require('dayjs') as typeof import('dayjs');
const utc = require('dayjs/plugin/utc');
const tz = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(tz);

describe('AuthenticationService', () => {
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
      imports: [ 
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
      })],
      providers: [
        AuthenticationService,
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
  });

  it('login to get access_token case valid authen', async () => {
    const contextId = ContextIdFactory.create();
    await moduleRef.registerRequestByContextId({ headers: {} }, contextId);
    const service = await moduleRef.resolve(AuthenticationService, contextId);

    const dtoLogin: SignInDto = { username: "admin", password: "admin" } as any;

    const authen = await service.login(dtoLogin);
    expect(authen.access_token).toBeDefined();
  });

  it('login to get access_token case invalid authen', async () => {
    const contextId = ContextIdFactory.create();
    await moduleRef.registerRequestByContextId({ headers: {} }, contextId);
    const service = await moduleRef.resolve(AuthenticationService, contextId);

    const dtoLogin: SignInDto = { username: "admin2", password: "admin123" } as any;

    await expect(service.login(dtoLogin)).rejects.toThrow(UnauthorizedException);
  });
});
