import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller chính của ứng dụng
 * Cung cấp các endpoint cơ bản cho thông tin hệ thống
 */
@ApiTags('1-app') // Thêm số "1-" để đảm bảo app luôn hiển thị đầu tiên
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint hiển thị thông tin API
   * @returns Thông tin tổng quan về API
   */
  @Get()
  @ApiOperation({ summary: 'Hiển thị thông tin về API' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về thông tin tổng quan về API',
  })
  getAppInfo() {
    return this.appService.getAppInfo();
  }

  /**
   * Endpoint kiểm tra trạng thái hoạt động của API
   * @returns Thông tin trạng thái API
   */
  @Get('health')
  @HttpCode(200)
  @ApiOperation({ summary: 'Kiểm tra trạng thái hoạt động của API' })
  @ApiResponse({ 
    status: 200, 
    description: 'API đang hoạt động bình thường',
  })
  getHealthCheck() {
    return this.appService.getHealthCheck();
  }

  /**
   * Endpoint được bảo vệ bằng JWT để kiểm tra xác thực
   * @returns Thông báo xác thực thành công
   */
  @Get('secure')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Endpoint được bảo vệ để kiểm tra xác thực' })
  @ApiResponse({ 
    status: 200, 
    description: 'Người dùng đã được xác thực thành công',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Không được phép truy cập - Token không hợp lệ hoặc đã hết hạn',
  })
  getSecureEndpoint() {
    return { 
      message: 'Bạn đã truy cập thành công endpoint được bảo vệ',
      timestamp: new Date().toISOString(),
    };
  }
}
