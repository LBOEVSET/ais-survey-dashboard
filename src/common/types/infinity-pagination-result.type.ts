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

export type MystockPaginationResultType = Readonly<{
  status_code: number;
	alert: AlertResponse;
  data: MystockListResponse;
  hasNextPage: boolean;
}>;

export type MystockListResponse = {
	total_list: number;
	list: any[];
};

export type MarketplaceSearchTypeResponse = {
  type: number;
	name: string;
	description: string | null;
  project_data: object | null;
	image_url: string;
  url: string;
};

export type MarketplacePaginationResultType = Readonly<{
  status_code: number;
	alert: AlertResponse;
  data: MarketplaceListResponse;
  hasNextPage: boolean;
}>;

export type NotifyMePaginationResultType = Readonly<{
  status_code: number;
	alert: AlertResponse;
  data: NotifyMeListResponse;
  hasNextPage: boolean;
}>;

export type MarketplaceListResponse = {
  search_type: MarketplaceSearchTypeResponse;
  next_long_banner_index: number;
	list: any[];
  event: EventDataModel;
};

export type EventDataModel = {
  id: number;
  image_url: string;
	url: string;
};

export type NotifyMeSearchTypeResponse = {
  notify_type: number;
	name: string;
	max_notify: number;
	current_notify: number;
	icon_url: string;
};

export type NotifyMeListResponse = {
  notify_category: NotifyMeSearchTypeResponse[];
	list: any[];
};

export type CreditPaginationResultType = Readonly<{
  status_code: number;
	alert: AlertResponse;
  data: CreditResponse;
  hasNextPage: boolean;
}>;

export type CreditResponse = {
  date: string;
	list: any[];
};