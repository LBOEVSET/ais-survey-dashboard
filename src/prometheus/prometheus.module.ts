import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { PrometheusService } from './prometheus.service';
import { TimeStampService } from './timeStamp';

@Module({
  imports: [PrometheusModule.register({
    defaultMetrics: {
      enabled: false,
    },
  }),],
  providers: [
    makeCounterProvider({
      name: 'http_request_counter',
      help: 'http_request_counter', // you can do better, I know :D
      // label names we would like to track
      labelNames: ['endpointName', 'cmdName', 'method', 'containerId'],
    }),
    makeCounterProvider({
      name: 'http_response_counter',
      help: 'http_response_counter', // you can do better, I know :D
      // label names we would like to track
      labelNames: ['endpointName', 'cmdName', 'httpStatus', 'responseCode', 'containerId'],
    }),
    makeCounterProvider({
      name: 'database_request_counter',
      help: 'database_request_counter', // you can do better, I know :D
      // label names we would like to track
      labelNames: ['operation', 'collectionName', 'containerId'],
    }),
    makeCounterProvider({
      name: 'database_response_counter',
      help: 'database_response_counter', // you can do better, I know :D
      // label names we would like to track
      labelNames: ['operation', 'collectionName', 'code', 'containerId'],
    }),
    PrometheusService,
    TimeStampService,
  ],
  exports: [PrometheusService],
})
export class MetricsModule {}
