import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeStampService {
  private _startTime: any;
  private _usageTime: any;

  setStartTime(timestamp: any) {
    this._startTime = timestamp;
  }
  setUsageTime(timestamp: any) {
    this._usageTime = (timestamp - this._startTime) / 10000;
    
    return this._usageTime;
  }
  getUsageTime() {
    return this._usageTime;
  }
}
