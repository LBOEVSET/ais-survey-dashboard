import { AlertResponse, IPaginationOptions, InfinityPaginationResultType, InfinityPaginationResultWithTotalType, MystockPaginationResultType, MystockListResponse, MarketplaceListResponse, MarketplacePaginationResultType, CreditResponse ,CreditPaginationResultType, NotifyMePaginationResultType, NotifyMeListResponse } from "../types";

export const infinityPagination = <T>(
  status_code: number,
  data: T[],
  options: IPaginationOptions,
	alert: AlertResponse,
): InfinityPaginationResultType<T> => {
  return {
    status_code,
    alert: alert ?? null,
    data,
    hasNextPage: data.length >= options.limit,
  };
};

export const infinityPaginationWithTotal = <T>(
  status_code: number,
  data: {
    list: T[],
    total_list: number,
  },
  options: IPaginationOptions,
	alert: AlertResponse,
): InfinityPaginationResultWithTotalType<T> => {
  return {
    status_code,
    alert: alert ?? null,
    data,
    hasNextPage: data.list.length >= options.limit,
  };
};
