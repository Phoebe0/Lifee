import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common'
import { AppException } from '../exceptions/app.exception'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<any>()
    const request = ctx.getRequest<any>()
    const traceId = (request.headers['x-trace-id'] as string | undefined) ?? 'unknown'

    if (exception instanceof AppException) {
      return response.status(exception.getStatus()).json({
        code: exception.code,
        message: exception.message,
        data: null,
        traceId,
        serverTime: Date.now()
      })
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const payload = exception.getResponse()
      const message = typeof payload === 'string' ? payload : 'request failed'

      return response.status(status).json({
        code: 'HTTP_ERROR',
        message,
        data: null,
        traceId,
        serverTime: Date.now()
      })
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: 'SERVER_500',
      message: 'internal server error',
      data: null,
      traceId,
      serverTime: Date.now()
    })
  }
}
