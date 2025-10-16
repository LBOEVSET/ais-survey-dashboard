import { AlertResponse } from './alert.type';
import { ValidationError } from "class-validator";

export type ErrorResponse = {
  status_code: number;
  alert: AlertResponse | null;
  path: string;
  error: string;
  validated?: { [key: string]: string[] };
};
