// src/prometheus/prometheus.service.test.ts
import { Test } from '@nestjs/testing';
import { PrometheusService } from './prometheus.service';
import { TimeStampService } from './timeStamp';
import { getToken } from '@willsoto/nestjs-prometheus'; // <-- important

function makeCounterMock() {
  const inc = jest.fn();
  const self: any = { inc, labels: jest.fn(() => self) }; // chainable labels()
  return self;
}

describe('PrometheusService', () => {
  let service: PrometheusService;
  let httpReqCounter: any;
  let httpResCounter: any;
  let dbReqCounter: any;
  let dbResCounter: any;

  beforeEach(async () => {
    httpReqCounter = makeCounterMock();
    httpResCounter = makeCounterMock();
    dbReqCounter = makeCounterMock();
    dbResCounter = makeCounterMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PrometheusService,
        { provide: TimeStampService, useValue: { now: () => new Date() } },

        // ✅ provide mocks using the correct tokens
        { provide: getToken('http_request_counter'), useValue: httpReqCounter },
        { provide: getToken('http_response_counter'), useValue: httpResCounter },
        { provide: getToken('database_request_counter'), useValue: dbReqCounter },
        { provide: getToken('database_response_counter'), useValue: dbResCounter },
      ],
    }).compile();

    service = moduleRef.get(PrometheusService);
  });

  it('should increment http_request_counter on httpRequest', () => {
    service.httpRequest('api', 'listUsers', 'GET');
    expect(httpReqCounter.labels).toHaveBeenCalledWith('api', 'listUsers', 'GET', expect.any(String));
    expect(httpReqCounter.inc).toHaveBeenCalled();
  });

  it('should increment http_response_counter on httpResponse', () => {
    service.httpResponse('api', 'listUsers', '200', 'OK');
    expect(httpResCounter.labels).toHaveBeenCalledWith('api', 'listUsers', '200', 'OK', expect.any(String));
    expect(httpResCounter.inc).toHaveBeenCalled();
  });

  it('should increment database_request_counter on databaseRequest', () => {
    service.databaseRequest('find', 'users');
    expect(dbReqCounter.labels).toHaveBeenCalledWith('find', 'users', expect.any(String));
    expect(dbReqCounter.inc).toHaveBeenCalled();
  });

  it('should increment database_response_counter on databaseResponse', () => {
    service.databaseResponse('find', 'users', '0');
    expect(dbResCounter.labels).toHaveBeenCalledWith('find', 'users', '0', expect.any(String));
    expect(dbResCounter.inc).toHaveBeenCalled();
  });
});
