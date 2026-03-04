import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<{ method: string; url: string }>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException ? exception.message : '服务器内部错误，请稍后重试';

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
    }

    response.status(status).send({
      code: status,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: `${request.method} ${request.url}`,
    });
  }
}
