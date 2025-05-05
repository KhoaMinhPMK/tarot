import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';

/**
 * Filter xử lý tất cả các ngoại lệ trong ứng dụng
 * Chuyển đổi các lỗi thành định dạng phản hồi chuẩn
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // Lấy HttpAdapter từ context
    const { httpAdapter } = this.httpAdapterHost;

    // Lấy context HTTP
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    // Xác định mã trạng thái HTTP
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Lấy thông báo lỗi
    let errorMessage = 'Đã xảy ra lỗi nội bộ';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        if ('message' in response) {
          errorMessage = Array.isArray(response['message'])
            ? response['message'].join(', ')
            : String(response['message']);
        }
        if ('error' in response) {
          errorDetails = response['error'];
        }
      } else {
        errorMessage = String(response);
      }
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      errorDetails = exception.stack || null;
    }

    // Log lỗi
    this.logger.error(
      `[${request.method}] ${request.url} - ${httpStatus} - ${errorMessage}`,
      errorDetails || '',
    );

    // Tạo đối tượng phản hồi
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
      // Chỉ trả về chi tiết lỗi trong môi trường phát triển
      ...(process.env.NODE_ENV !== 'production' && { details: errorDetails }),
    };

    // Gửi phản hồi lỗi
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}