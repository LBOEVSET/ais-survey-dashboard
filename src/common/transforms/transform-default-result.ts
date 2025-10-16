import { DefaultResult, AlertResponse } from "../types";

export const transformDefaultResult = <T>(status_code: number, data: T[] | T | number[], alert: AlertResponse): DefaultResult<T> => {
	if (typeof data === "boolean") {
		return {
			status_code,
			alert: alert ?? null,
			data: null,
		};
	}
	return {
		status_code,
		alert: alert ?? null,
		data: data,
	};
};


