import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : 'Something went wrong';
    const raw = typeof body === 'string' ? body : (body as { message?: string | string[] }).message;
    response.status(status).json({ success: false, message: Array.isArray(raw) ? raw.join(', ') : raw ?? 'Something went wrong' });
  }
}
