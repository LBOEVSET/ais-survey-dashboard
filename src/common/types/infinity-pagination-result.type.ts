import { AlertResponse } from "./alert.type";

export type InfinityPaginationResultType<T> = Readonly<{
  status_code: number;
	alert: AlertResponse;
  data: T[] | null;
  hasNextPage: boolean;
}>;

export type InfinityPaginationResultWithTotalType<T> = Readonly<{
  status_code: number;
	alert: AlertResponse;
  data: {
    list: T[],
    total_list: number,
  };
  hasNextPage: boolean;
}>;
