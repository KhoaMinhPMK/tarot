import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  UseGuards, 
  Get, 
  Req, 
  Param, 
  Query, 
  UnauthorizedException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth, 
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Controller xử lý các yêu cầu liên quan đến xác thực
 * Bao gồm đăng ký, đăng nhập, xác nhận email, đặt lại mật khẩu...
 */
@ApiTags('2-auth')
@Controller('auth')
@UseGuards(ThrottlerGuard) // Áp dụng giới hạn tần suất gọi API để chống tấn công brute-force
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Đăng ký người dùng mới
   * @param registerDto Thông tin đăng ký
   * @returns Thông tin người dùng đã tạo và token đăng nhập
   */
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký người dùng mới' })
  @ApiResponse({ 
    status: 201, 
    description: 'Đăng ký thành công, trả về thông tin người dùng và token' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email hoặc tên đăng nhập đã tồn tại' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dữ liệu đầu vào không hợp lệ' 
  })
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Đăng nhập hệ thống
   * @param loginDto Thông tin đăng nhập
   * @returns Token truy cập và thông tin người dùng
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập với tên đăng nhập/email và mật khẩu' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng nhập thành công, trả về token truy cập và thông tin người dùng' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Thông tin đăng nhập không chính xác' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Tài khoản đã bị vô hiệu hóa' 
  })
  @ApiBody({ type: LoginUserDto })
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Xem thông tin người dùng hiện tại (từ token)
   * @param req Request chứa thông tin người dùng từ middleware JWT
   * @returns Thông tin người dùng đã đăng nhập
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thông tin người dùng đã đăng nhập (yêu cầu xác thực)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin người dùng' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Không được xác thực hoặc token hết hạn' 
  })
  getProfile(@Req() req) {
    return { user: req.user };
  }

  /**
   * Xác nhận email người dùng
   * @param token Token xác nhận email
   * @returns Thông báo xác nhận thành công
   */
  @Get('confirm-email')
  @ApiOperation({ summary: 'Xác nhận email người dùng' })
  @ApiQuery({ 
    name: 'token', 
    description: 'Token xác nhận email', 
    required: true 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email đã được xác nhận thành công' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token không hợp lệ hoặc đã hết hạn' 
  })
  async confirmEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token xác nhận không được cung cấp');
    }

    const confirmed = await this.authService.confirmEmail(token);
    
    return {
      message: 'Địa chỉ email đã được xác nhận thành công',
      confirmed,
    };
  }

  /**
   * Yêu cầu đặt lại mật khẩu
   * @param email Email của tài khoản cần đặt lại mật khẩu
   * @returns Thông báo hướng dẫn được gửi tới email
   */
  @Post('forgot-password')
  @ApiOperation({ summary: 'Yêu cầu đặt lại mật khẩu' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Email đã đăng ký',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Hướng dẫn đặt lại mật khẩu đã được gửi tới email' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Email không tồn tại trong hệ thống' 
  })
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email không được để trống');
    }

    await this.authService.forgotPassword(email);
    
    return {
      message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi tới địa chỉ email đó',
    };
  }

  /**
   * Đặt lại mật khẩu với token
   * @param token Token đặt lại mật khẩu
   * @param newPassword Mật khẩu mới
   * @returns Thông báo đặt lại mật khẩu thành công
   */
  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu bằng token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Token đặt lại mật khẩu',
        },
        newPassword: {
          type: 'string',
          description: 'Mật khẩu mới',
        },
      },
      required: ['token', 'newPassword'],
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Mật khẩu đã được đặt lại thành công' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token không hợp lệ hoặc đã hết hạn' 
  })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!token || !newPassword) {
      throw new BadRequestException('Token và mật khẩu mới không được để trống');
    }

    await this.authService.resetPassword(token, newPassword);
    
    return {
      message: 'Mật khẩu đã được đặt lại thành công',
    };
  }
}