import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from "mongoose";
import { CustomLoggerService, LoggerAction, DBActionEnum, CustomSingletonLoggerService, ApplicationInsightsService, LoggerActionEnum, EncryptionService } from "@eqxjs/stub";
import { UtilsService } from "../utils/utils.services";
import { PrometheusService } from '../prometheus/prometheus.service';
import { ObjectId } from "mongodb";
import { MongoConnectionService } from '../database/mongoconnection.service';
import { DashBoardResponse } from "./types";
import { Injectable, Scope } from '@nestjs/common';
import { DashBoardDto } from './dtos';
import dayjs = require('dayjs');  
import utc = require('dayjs/plugin/utc');
import tz = require('dayjs/plugin/timezone');

dayjs.extend((utc as any).default ?? (utc as any));  
dayjs.extend((tz as any).default ?? (tz as any));

export enum databaseOperations {
  read = 'read',
  create = 'create',
  update = 'update',
  delete = 'delete',
}

let databaseConfig
let appConfig
let azureConfig
@Injectable({ scope: Scope.REQUEST }) 
export class DashBoardService {
  constructor(
    private readonly mongoService: MongoConnectionService,
    private singletonLogger: CustomSingletonLoggerService,
    private customPrometheusService: PrometheusService,
    private logger: CustomLoggerService,
    private appInsights: ApplicationInsightsService,
    private encryptionService: EncryptionService,
    // @InjectConnection('datasync') private datasync: Connection
  ) {
    databaseConfig = UtilsService.getDBConfig()
    appConfig = UtilsService.getAppConfig()
  }

  async getUserRating(data: DashBoardDto): Promise<DashBoardResponse[]> {
    let queryts;
    const userRatingCollectionName: string = databaseConfig.survey[0].listCollectionMongo.collectionName;
    const mainMongoConnection = this.mongoService.getConnection(`survey`);
    const init2MongoConnection = this.mongoService.getConnection(userRatingCollectionName);
    let start = performance.now();
    const startDate = dayjs().tz('Asia/Bangkok').startOf('month').toDate();
    const endDate   = dayjs(startDate).add(1, 'month').toDate();
    const query = { ts: { $gte: startDate, $lt: endDate } };
    const skip = (data.page - 1) * data.limit;
    try{
        queryts = await mainMongoConnection
            .collection(userRatingCollectionName)
            .find(
                query, 
                { sort: { ts: -1 } }
            )
            .skip(skip)
            .limit(data.limit)
            .toArray();
        let end = performance.now();
        this.customPrometheusService.databaseResponse(
            databaseOperations.read,
            userRatingCollectionName,
        );

        this.logger.setDependencyMetadata({
            dependency: mainMongoConnection?.db?.namespace,
            responseTime: +(end - start).toFixed(2),
            resultCode: '20000',
        }).debug(LoggerAction.DB_RESPONSE(DBActionEnum.READ, `(${mainMongoConnection?.db?.namespace}:${userRatingCollectionName} -> mobile-data-synchronizer`), queryts);
        
        return queryts;

    }catch(error){
        let end = performance.now();
        this.appInsights.trackDependency({
            target: LoggerActionEnum.DB_REQUEST,
            name: userRatingCollectionName,
            data: JSON.stringify(query),
            duration: end - start,
            resultCode: 50002,
            success: true,
            dependencyTypeName: mainMongoConnection?.db?.namespace ?? ''
        })
        
        return [];
    }
  }
}
