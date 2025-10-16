// probe.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ProbeInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const stream = next.handle();
    if (!stream || typeof (stream as any).subscribe !== 'function') {
      const ctrl = ctx.getClass?.()?.name ?? '-';
      const handler = ctx.getHandler?.()?.name ?? '-';
      throw new Error(`Upstream did not return an Observable at ${ctrl}#${handler}`);
    }
    const ctrl = ctx.getClass?.()?.name ?? '-';
    const handler = ctx.getHandler?.()?.name ?? '-';
    return stream.pipe(
      catchError((err) => {
        // This will fire for operator errors inside the stream (like your case)
        console.error(`[Probe] stream error at ${ctrl}#${handler}:`, err?.message ?? err);
        return throwError(() => err);
      }),
    );
  }
}
