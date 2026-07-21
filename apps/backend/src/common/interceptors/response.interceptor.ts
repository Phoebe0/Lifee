import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import { map, Observable } from 'rxjs'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ headers?: Record<string, string> }>()
    const traceId = request.headers?.['x-trace-id'] ?? 'unknown'

    return next.handle().pipe(
      map((data) => ({
        code: 'OK',
        message: 'success',
        data,
        traceId,
        serverTime: Date.now()
      }))
    )
  }
}
