import { ValidationError } from "class-validator";

export enum AlertType {
	info = "info",
	error = "error",
	warning = "warning",
	success = "success",
}

export type AlertResponse = {
	type: AlertType;
	title: string;
	description: string | ValidationError[];
};
