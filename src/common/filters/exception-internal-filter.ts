import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ExecutionContext
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse, AlertType } from "../types";
import { STATUS_CODES } from "node:http";
import { LoggerAction } from '@eqxjs/stub';
import { CustomLoggerService } from '../../loggers/logger.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongoServerError } from 'mongodb';
import mongoose from 'mongoose';
import 'source-map-support/register';
import { DateTime } from 'luxon';

@Catch()
export class ExceptionsFilterInternalError implements ExceptionFilter {
  constructor(
    private readonly loggerService: CustomLoggerService,
    private readonly logger: LoggerAction,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const params = request.params;
    const body = {
      raw: request.body,
      urlencoded: request.body,
    };
    const query = request.query;
    const currentTime = DateTime.now().setZone('Asia/Bangkok');
    // Controller & handler (use ExecutionContext, NOT http host)
    const ec = host as unknown as ExecutionContext;
    const controller = ec?.getClass?.()?.name ?? '-';
    const handler = ec?.getHandler?.()?.name ?? '-';
    const safeJsonSstringify = (v: any) => { try { return JSON.stringify(v); } catch { return '[unserializable]'; } };
    
    // Check if exception is handled by another filter
    if (exception instanceof HttpException && exception.getStatus() !== HttpStatus.INTERNAL_SERVER_ERROR) {
      return false; // Let other filters handle it
    }

    // Determine the status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Get exception message
    let exceptionMessage = 'Internal server error';
    if (exception instanceof Error) {
      exceptionMessage = exception.message;
    } else if (exception instanceof HttpException) {
      exceptionMessage = exception.message;
    } else if (exception instanceof MongoServerError) {
      exceptionMessage = exception.message;
    }

    // Prepare the error response
		const errorResponse: ErrorResponse = {
			status_code: status,
			alert: null,
			path: request.url,
			error: STATUS_CODES[status],
			validated: {},
		};

    let decodedToken: unknown = null;
    try {
      const token = this.extractTokenFromHeader(request);
      decodedToken = this.jwtService.decode(token ?? '') ?? null;
    } catch { decodedToken = null; } 

    const token = this.extractTokenFromHeader(request);
    const bypassToken = this.isBypassToken(request);
    const stack = exception instanceof Error ? (exception.stack ?? '') : '';
    const { file, line, column } = this.pickTopFrameLoose(stack);

    const payload = {
      path: request.url,
			time: currentTime,
			code: status,
      params: safeJsonSstringify(params),
      query: safeJsonSstringify(query),
      raw: safeJsonSstringify(body.raw),
      urlencoded: safeJsonSstringify(body.urlencoded),
      token: token ?? "",
      bypassToken: bypassToken ?? "",
      decodedToken: safeJsonSstringify(decodedToken) ?? "",
			exception: STATUS_CODES[status] ?? 'Error',
      validated: {},
			message: exceptionMessage
    }

    //this.logger.error(LoggerAction.EXCEPTION('error function checkAssetList'), error.message)
    try {
      const trace = stack || undefined;
      this.loggerService.error(
        `Internal error at ${file ?? 'unknown'}:${line ?? '-'}:${column ?? '-'} | ${payload.message} | ${controller ?? '-'}#${handler ?? '-'}`,
        trace,
        'ExceptionsFilterInternalError'
      );
      // If parser failed, also emit whole stack once
      if (!file && stack) console.error('[stack fallback]\n' + stack);
    } catch (e) {
      console.error('[logger fallback]', e, '\n[payload]', payload, '\n[stack]\n', stack);
    }

    // Send the response
    response.status(status).json(errorResponse);
    return true; // Indicate this filter handled the exception
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isBypassToken(request: Request): string {
    const bypassToken = request?.headers['x-access-bypass'] ?? "" as string;
    return bypassToken as string; 
  }

  private pickTopFrameLoose(stack: string): { file: string | null; line: number | null; column: number | null } {
    if (!stack) return { file: null, line: null, column: null };
    const cwd = process.cwd().replace(/\\/g, '/');

    const parse = (ln: string) => {
      // supports: "at Foo (path/file.ts:12:34)" or "at path/file.ts:12:34" or even "path/file.ts:12:34"
      const m1 = ln.match(/\(([^)]+):(\d+):(\d+)\)$/);
      const m2 = ln.match(/\s+at\s+([^(\s]+):(\d+):(\d+)$/);
      const m3 = ln.match(/^\s*([^()\s]+):(\d+):(\d+)\s*$/);
      const m = m1 ?? m2 ?? m3;
      if (!m) return null;
      return { file: m[1].replace(/\\/g, '/'), line: Number(m[2]), column: Number(m[3]) };
    };

    const lines = stack.split('\n').map(s => s.trim()).filter(Boolean);

    // 1) Prefer frames in app (cwd), skip node internals
    for (const ln of lines) {
      if (ln.includes('node:internal') || ln.startsWith('internal/') || ln.includes('(internal')) continue;
      const f = parse(ln);
      if (f && f.file.startsWith(cwd)) return f;
    }

    // 2) Otherwise, first non-internal frame, even in node_modules
    for (const ln of lines) {
      if (ln.includes('node:internal') || ln.startsWith('internal/') || ln.includes('(internal')) continue;
      const f = parse(ln);
      if (f) return f;
    }

    // 3) Last resort: any frame with :line:col
    for (const ln of lines) {
      const f = parse(ln);
      if (f) return f;
    }

    return { file: null, line: null, column: null };
  }
}