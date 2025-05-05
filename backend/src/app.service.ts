import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service cung cấp các chức năng chung cho ứng dụng
 */
@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  /**
   * Trả về thông tin hệ thống
   * @returns Thông tin API và môi trường hệ thống
   */
  getAppInfo(): any {
    return {
      name: 'Tarot App API',
      version: '1.0.0',
      description: 'API cho ứng dụng Tarot với chức năng xác thực người dùng',
      environment: this.configService.get('NODE_ENV', 'development'),
      apiDocs: '/api/docs',
      author: 'GitHub Copilot',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Kiểm tra trạng thái hoạt động của API
   * @returns Thông tin trạng thái API
   */
  getHealthCheck(): any {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}
