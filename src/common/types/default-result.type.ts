import { AlertResponse } from './alert.type';
import { IPaginationOptions } from './pagination-options.type';

export type DefaultResult<T> = Readonly<{
  status_code: number;
  alert: AlertResponse;
  data: T[] | T | number[] | null;
  options?: IPaginationOptions;
}>;
