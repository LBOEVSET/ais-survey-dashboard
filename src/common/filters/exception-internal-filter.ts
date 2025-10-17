import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ExecutionContext
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from "../types";
import { STATUS_CODES } from "node:http";
import { LoggerAction } from '@eqxjs/stub';
import { CustomLoggerService } from '../../loggers/logger.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongoServerError } from 'mongodb';
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

  private static readonly MAX_STACK_LINE = 4096;

  private normalizeFile(p: string): string {
    return p.replaceAll('\\', '/');
  }

  private parseFileLineCol(s: string): { file: string; line: number; column: number } | null {
    const capped = s.length > ExceptionsFilterInternalError.MAX_STACK_LINE
      ? s.slice(0, ExceptionsFilterInternalError.MAX_STACK_LINE)
      : s;

    const lastColon = capped.lastIndexOf(':');
    if (lastColon < 0) return null;
    const secondLastColon = capped.lastIndexOf(':', lastColon - 1);
    if (secondLastColon < 0) return null;

    const file = this.normalizeFile(capped.slice(0, secondLastColon).trim());
    const lineStr = capped.slice(secondLastColon + 1, lastColon);
    const colStr = capped.slice(lastColon + 1);

    const line = Number(lineStr);
    const column = Number(colStr);
    if (!Number.isFinite(line) || !Number.isFinite(column)) return null;

    // Basic sanity: avoid weird file chars that indicate we parsed the wrong segment
    if (!file || /[\r\n()]/.test(file)) return null;

    return { file, line, column };
  }

  private parseParen(ln: string) {
    // matches: "... (path/file.ts:12:34)"
    const end = ln.lastIndexOf(')');
    if (end < 0) return null;
    const start = ln.lastIndexOf('(', end);
    if (start < 0 || start + 1 >= end) return null;
    return this.parseFileLineCol(ln.slice(start + 1, end));
  }

  private parseAfterAt(ln: string) {
    // matches: "    at path/file.ts:12:34"
    const at = ln.lastIndexOf(' at ');
    const seg = at >= 0 ? ln.slice(at + 4) : ln.trim();
    return this.parseFileLineCol(seg);
  }

  private parseBare(ln: string) {
    // matches: "path/file.ts:12:34"
    return this.parseFileLineCol(ln.trim());
  }

  private isInternalLine(ln: string) {
    return ln.includes('node:internal') || ln.startsWith('internal/') || ln.includes('(internal');
  }

  private pickTopFrameLoose(stack: string): { file: string | null; line: number | null; column: number | null } {
    if (!stack) return { file: null, line: null, column: null };

    const cwd = process.cwd().replaceAll('\\', '/');
    const lines = stack
      .split('\n')
      .map(s => {
        const t = s.trim();
        return t.length > ExceptionsFilterInternalError.MAX_STACK_LINE
          ? t.slice(0, ExceptionsFilterInternalError.MAX_STACK_LINE)
          : t;
      })
      .filter(Boolean);

    const parseLine = (ln: string) => this.parseParen(ln) ?? this.parseAfterAt(ln) ?? this.parseBare(ln);

    // 1) Prefer frames under cwd (skip Node internals)
    for (const ln of lines) {
      if (this.isInternalLine(ln)) continue;
      const f = parseLine(ln);
      if (f?.file?.startsWith(cwd)) return f;
    }

    // 2) Otherwise, first non-internal frame (may be in node_modules)
    for (const ln of lines) {
      if (this.isInternalLine(ln)) continue;
      const f = parseLine(ln);
      if (f) return f;
    }

    // 3) Last resort: any frame with :line:col
    for (const ln of lines) {
      const f = parseLine(ln);
      if (f) return f;
    }

    return { file: null, line: null, column: null };
  }

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

    const ec = host as unknown as ExecutionContext;
    const controller = ec?.getClass?.()?.name ?? '-';
    const handler = ec?.getHandler?.()?.name ?? '-';
    const safeJsonSstringify = (v: any) => { try { return JSON.stringify(v); } catch { return '[unserializable]'; } };

    if (exception instanceof HttpException && exception.getStatus() !== HttpStatus.INTERNAL_SERVER_ERROR) {
      return false;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let exceptionMessage = 'Internal server error';
    if (exception instanceof Error || exception instanceof HttpException || exception instanceof MongoServerError) {
      exceptionMessage = (exception as any).message;
    }

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
    };

    try {
      const trace = stack || undefined;
      this.loggerService.error(
        `Internal error at ${file ?? 'unknown'}:${line ?? '-'}:${column ?? '-'} | ${payload.message} | ${controller ?? '-'}#${handler ?? '-'}`,
        trace,
        'ExceptionsFilterInternalError'
      );
      if (!file && stack) console.error('[stack fallback]\n' + stack);
    } catch (e) {
      console.error('[logger fallback]', e, '\n[payload]', payload, '\n[stack]\n', stack);
    }

    response.status(status).json(errorResponse);
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isBypassToken(request: Request): string {
    const bypassToken = (request?.headers['x-access-bypass'] ?? "") as string;
    return bypassToken;
  }
}
