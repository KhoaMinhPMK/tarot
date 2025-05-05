import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor ghi log tất cả các request và response
 * Ghi lại thông tin request khi bắt đầu xử lý và thời gian hoàn thành khi kết thúc
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Lấy thông tin request
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, ip, body } = request;
    const userAgent = request.get('user-agent') || '';
    
    // Ghi log khi request bắt đầu được xử lý
    this.logger.debug(
      `[${method}] ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    );
    
    // Không log mật khẩu hoặc thông tin nhạy cảm
    const sanitizedBody = { ...body };
    if (sanitizedBody.password) sanitizedBody.password = '******';
    
    // Log tham số của request (nếu có)
    if (Object.keys(sanitizedBody).length > 0) {
      this.logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
    }

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap({
          next: (val) => {
            // Log khi request được xử lý thành công
            this.logger.debug(
              `[${method}] ${originalUrl} - ${Date.now() - now}ms - Success`,
            );
          },
          error: (err) => {
            // Log khi xảy ra lỗi
            this.logger.error(
              `[${method}] ${originalUrl} - ${Date.now() - now}ms - Error: ${err.message}`,
              err.stack,
            );
          },
        }),
      );
  }
}