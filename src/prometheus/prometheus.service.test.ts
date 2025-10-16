import { Test, TestingModule } from '@nestjs/testing';
import { PrometheusService } from './prometheus.service';
import { makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { Counter, register} from 'prom-client';
import { TimeStampService } from './timeStamp';

describe('PrometheusService', () => {
    let service: PrometheusService;
    let counterHTTPRequest: Counter<string>;
    let counterHTTPResponse: Counter<string>;
    let counterdatabaseRequest: Counter<string>;
    let counterdatabaseResponse: Counter<string>;

    beforeEach(async () => {
        register.clear()
        counterHTTPRequest = new Counter({ name: 'http_request_counter', help: 'help' ,labelNames: ['topic', 'containerId']});
        counterHTTPResponse = new Counter({ name: 'http_response_counter', help: 'help' ,labelNames: ['topic', 'containerId']});
        counterdatabaseRequest = new Counter({ name: 'database_request_counter', help: 'help' ,labelNames: ['topic', 'containerId']});
        counterdatabaseResponse = new Counter({ name: 'database_response_counter', help: 'help' ,labelNames: ['topic', 'containerId']});

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PrometheusService,
                TimeStampService,
                makeCounterProvider({ name: 'http_request_counter', help: 'help' }),
                makeCounterProvider({ name: 'http_response_counter', help: 'help' }),
                makeCounterProvider({ name: 'database_request_counter', help: 'help' }),
                makeCounterProvider({ name: 'database_response_counter', help: 'help' }),
            ],
        }).compile();

        service = module.get<PrometheusService>(PrometheusService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should increment http_request_counter on httpRequest', () => {
        const node = 'test-node';
        const cmd = 'test-cmd';
        const method = 'GET';
        service.httpRequest(node, cmd, method);
        expect(counterHTTPRequest.labels(node, cmd, method, 'INTERNAL_OS_NAME').inc).toHaveBeenCalled();
    });

    it('should increment http_response_counter on httpResponse', () => {
        const node = 'test-node';
        const cmd = 'test-cmd';
        const httpstatus = '200';
        const code = '0';
        service.httpResponse(node, cmd, httpstatus, code);
        expect(counterHTTPResponse.labels(node, cmd, httpstatus, code, 'INTERNAL_OS_NAME').inc).toHaveBeenCalled();
    });

    it('should increment database_request_counter on databaseRequest', () => {
        const operation = 'find';
        const collectionName = 'test-collection';
        service.databaseRequest(operation, collectionName);
        expect(counterdatabaseRequest.labels(operation, collectionName, 'INTERNAL_OS_NAME').inc).toHaveBeenCalled();
    });

    it('should increment database_response_counter on databaseResponse', () => {
        const operation = 'find';
        const collectionName = 'test-collection';
        const code = '0';
        service.databaseResponse(operation, collectionName, code);
        expect(counterdatabaseResponse.labels(operation, collectionName, code, 'INTERNAL_OS_NAME').inc).toHaveBeenCalled();
    });
});