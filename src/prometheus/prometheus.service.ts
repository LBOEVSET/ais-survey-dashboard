import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram, Gauge, Counter } from 'prom-client';
import { TimeStampService } from './timeStamp';
import { INTERNAL_OS_NAME } from "@eqxjs/stub";

let containerId = INTERNAL_OS_NAME

@Injectable()
export class PrometheusService {
  constructor(
    @InjectMetric('http_request_counter')
    public readonly counterHTTPRequest: Counter<string>,
    @InjectMetric('http_response_counter')
    public readonly counterHTTPResponse: Counter<string>,
    @InjectMetric('database_request_counter')
    private readonly counterdatabaseRequest: Counter<string>,
    @InjectMetric('database_response_counter')
    private readonly counterdatabaseResponse: Counter<string>,
    private timeStampService: TimeStampService,
  ) {}

  httpRequest(node, cmd, method) {
    this.counterHTTPRequest.labels(node, cmd, method, containerId).inc();
  }
  httpResponse(node, cmd, httpstatus, code) {
    this.counterHTTPResponse.labels(node, cmd, httpstatus, code, containerId).inc();
  }
  databaseRequest(operation: string, collectionName: string) {
    this.counterdatabaseRequest.labels(operation, collectionName, containerId).inc();
  }
  databaseResponse(operation: string, collectionName: string, code = '0') {
    this.counterdatabaseResponse.labels(operation, collectionName, code, containerId).inc();
  }
}
