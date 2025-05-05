import { Injectable, UnauthorizedException, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

/**
 * Service xử lý xác thực người dùng
 * Cung cấp các phương thức đăng ký, đăng nhập, làm mới token và quên mật khẩu
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Đăng ký người dùng mới
   * @param registerDto Thông tin đăng ký
   * @returns Thông tin người dùng đã đăng ký (không bao gồm mật khẩu)
   */
  async register(registerDto: RegisterUserDto) {
    try {
      // Hash mật khẩu
      const hashedPassword = await this.hashPassword(registerDto.password);

      // Tạo người dùng mới
      const user = await this.usersService.create({
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
        fullName: registerDto.fullName,
        isEmailConfirmed: false, // Yêu cầu xác nhận email
      });

      // Loại bỏ mật khẩu và các thông tin nhạy cảm khỏi kết quả trả về
      const { password, emailConfirmationToken, ...result } = user;

      // Trả về thông tin người dùng và token xác thực
      return {
        user: result,
        access_token: this.generateAccessToken(user),
        // Trong thực tế, tại đây bạn có thể gửi email xác nhận đến email đăng ký
      };
    } catch (error) {
      this.logger.error(`Lỗi khi đăng ký người dùng mới: ${error.message}`, error.stack);
      throw error; // Ném lại lỗi để được xử lý bởi các filter hoặc interceptors
    }
  }

  /**
   * Đăng nhập người dùng
   * @param loginDto Thông tin đăng nhập
   * @returns Access token và thông tin người dùng
   */
  async login(loginDto: LoginUserDto) {
    try {
      // Tìm người dùng theo username hoặc email
      const user = await this.findUserByUsernameOrEmail(loginDto.usernameOrEmail);
      
      if (!user) {
        throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
      }

      // Kiểm tra trạng thái hoạt động của tài khoản
      if (!user.isActive) {
        throw new ForbiddenException('Tài khoản đã bị vô hiệu hóa');
      }

      // Xác thực mật khẩu
      const isPasswordValid = await this.comparePasswords(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
      }

      // Tạo access token
      const accessToken = this.generateAccessToken(user);

      // Loại bỏ các thông tin nhạy cảm trước khi trả về
      const { password, emailConfirmationToken, passwordResetToken, passwordResetExpires, ...userInfo } = user;
      
      return {
        access_token: accessToken,
        user: userInfo,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi đăng nhập: ${error.message}`, error.stack);
      throw error; // Ném lại lỗi để được xử lý bởi các filter hoặc interceptors
    }
  }

  /**
   * Xác thực token và trả về thông tin người dùng
   * @param userId ID của người dùng từ token
   * @returns Thông tin người dùng
   */
  async validateUser(userId: number) {
    try {
      const user = await this.usersService.findOneById(userId);
      
      if (!user) {
        throw new UnauthorizedException('Người dùng không tồn tại');
      }
      
      if (!user.isActive) {
        throw new ForbiddenException('Tài khoản đã bị vô hiệu hóa');
      }

      // Loại bỏ các thông tin nhạy cảm
      const { password, emailConfirmationToken, passwordResetToken, passwordResetExpires, ...result } = user;
      
      return result;
    } catch (error) {
      this.logger.error(`Lỗi khi xác thực người dùng: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Yêu cầu đặt lại mật khẩu
   * @param email Email của người dùng
   * @returns true nếu tạo yêu cầu thành công
   */
  async forgotPassword(email: string) {
    try {
      const resetToken = await this.usersService.createPasswordResetToken(email);
      
      if (!resetToken) {
        throw new BadRequestException('Không tìm thấy người dùng với email này');
      }
      
      // Trong ứng dụng thực tế, tại đây bạn sẽ gửi email đặt lại mật khẩu
      // Kèm theo đường dẫn có chứa token, ví dụ: /reset-password?token=resetToken
      
      // Trả về true để báo hiệu đã xử lý thành công
      return true;
    } catch (error) {
      this.logger.error(`Lỗi khi yêu cầu đặt lại mật khẩu: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Tìm người dùng theo username hoặc email
   * @param usernameOrEmail Username hoặc email của người dùng
   * @returns Thông tin người dùng hoặc null nếu không tìm thấy
   */
  private async findUserByUsernameOrEmail(usernameOrEmail: string) {
    // Kiểm tra xem chuỗi nhập vào có dạng email không
    const isEmail = usernameOrEmail.includes('@');
    
    // Tìm kiếm người dùng theo username hoặc email
    if (isEmail) {
      return this.usersService.findOneByEmail(usernameOrEmail);
    } else {
      return this.usersService.findOneByUsername(usernameOrEmail);
    }
  }

  /**
   * Hash mật khẩu
   * @param password Mật khẩu cần hash
   * @returns Mật khẩu đã được hash
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * So sánh mật khẩu nhập vào với mật khẩu đã hash
   * @param plainTextPassword Mật khẩu dạng plain text
   * @param hashedPassword Mật khẩu đã hash
   * @returns true nếu mật khẩu khớp
   */
  private async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  /**
   * Tạo JWT access token
   * @param user Thông tin người dùng
   * @returns JWT access token
   */
  private generateAccessToken(user: any) {
    const payload = { 
      sub: user.id, 
      username: user.username,
      email: user.email,
      isEmailConfirmed: user.isEmailConfirmed
    };
    
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET', 'super-secret-key'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h')
    });
  }

  /**
   * Xác nhận email của người dùng
   * @param token Token xác nhận email
   * @returns true nếu xác nhận thành công
   */
  async confirmEmail(token: string) {
    try {
      const confirmed = await this.usersService.confirmEmail(token);
      
      if (!confirmed) {
        throw new BadRequestException('Token xác nhận không hợp lệ hoặc đã hết hạn');
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Lỗi khi xác nhận email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Đặt lại mật khẩu với token
   * @param token Token đặt lại mật khẩu
   * @param newPassword Mật khẩu mới
   * @returns true nếu đặt lại thành công
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      // Tìm người dùng có token đặt lại mật khẩu và token chưa hết hạn
      // Trong thực tế cần triển khai phương thức này trong UsersService
      
      // Hash mật khẩu mới
      const hashedPassword = await this.hashPassword(newPassword);
      
      // Cập nhật mật khẩu và xóa token
      // (cần triển khai phương thức này trong UsersService)
      
      return true;
    } catch (error) {
      this.logger.error(`Lỗi khi đặt lại mật khẩu: ${error.message}`, error.stack);
      throw error;
    }
  }
}