import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import { ValidationError } from "class-validator";
import { Response } from "express";
import { isArray, isString } from "lodash";
import { STATUS_CODES } from "node:http";
import { ErrorResponse, AlertType, AlertResponse } from "../types";
import { CustomLoggerService } from '../../loggers/logger.service';
import * as jwt from 'jsonwebtoken';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly loggerService: CustomLoggerService,
	) {}
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest();
		const authHeader = request.headers['authorization']; 
		const token = authHeader?.replace('Bearer ', '');
		let statusCode = exception.getStatus();
		const extResponse = exception.getResponse() as {
			message: ValidationError[];
			alert: AlertResponse;
		};
		const validationErrors = extResponse.message;
		const alertErrors = extResponse.alert;
        const status_code = STATUS_CODES[statusCode as keyof typeof STATUS_CODES] ?? `HTTP ${statusCode}`;

		let errorResponse: ErrorResponse = {
			status_code: statusCode,
			alert: null,
			path: request.url,
			error: status_code,
		};

		if (alertErrors) {
			errorResponse.alert = {
				type: AlertType[alertErrors.type],
				title: alertErrors.title,
				description: alertErrors.description,
			};
		}

		if (isArray(validationErrors) || isString(validationErrors)) {
			this.loggerService.error(
				`validationErrors error: ${validationErrors}`
			);
            if (!errorResponse.alert) {
                errorResponse.alert = {
                    type: AlertType.error,
                    title: status_code,
                    description: validationErrors,
                };
            }
		}
		const decoded = jwt.decode(token) as { exp?: number };

		const isExpired = (decoded?.exp ?? 0 * 1000 < Date.now());
		if (token && isExpired) {
			statusCode = 403;
			errorResponse = {
				status_code: 403,
				alert: {
					type: AlertType['error'],
					title: "session_expired",
					description: "session_expired",
				},
				path: request.url,
				error: status_code,
			};
		}

		response.status(statusCode).json(errorResponse);
	}
}
