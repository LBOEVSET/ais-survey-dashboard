import { IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class DashBoardDto {
    @IsOptional()
    @Type(() => Number)
    @Min(1) @Max(12)
    month: number = 1;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    limit: number = 10;

    service: Service;
};

export type Service = {
    version: string,
    timestamp: Date,
    channel: string,
    networkInfo: NetworkInfo,
    deviceInfo: DeviceInfo,
    diagMessage: string
};

export type Identity = {
	device: string[],
    public: string,
    user: string
};

export type NetworkInfo = {
	isp: string[],
    ip: string,
};

export type DeviceInfo = {
    brand: string,
    model: string,
    os: string,
    osVersion: string
};