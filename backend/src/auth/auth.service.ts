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

      // Tạo access token và refresh token
      const tokens = await this.generateTokens(user);

      // Lưu refresh token vào database
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      // Loại bỏ các thông tin nhạy cảm trước khi trả về
      const { password, emailConfirmationToken, passwordResetToken, passwordResetExpires, refreshToken, refreshTokenExpires, ...userInfo } = user;
      
      return {
        ...tokens,
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
   * Làm mới access token bằng refresh token
   * @param refreshToken Refresh token
   * @returns Object chứa access_token và refresh_token mới
   */
  async refreshTokens(refreshToken: string) {
    try {
      // Xác thực refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET', 'super-secret-refresh-key'),
      });

      // Tìm người dùng theo ID từ payload
      const user = await this.usersService.findOneById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      // Kiểm tra xem refresh token có trùng khớp không
      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      // Kiểm tra xem refresh token có hết hạn không
      if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
        throw new UnauthorizedException('Refresh token đã hết hạn');
      }

      // Tạo tokens mới (access token và refresh token)
      const tokens = await this.generateTokens(user);
      
      // Cập nhật refresh token mới vào database
      await this.updateRefreshToken(user.id, tokens.refresh_token);
      
      return tokens;
    } catch (error) {
      this.logger.error(`Lỗi khi làm mới token: ${error.message}`, error.stack);
      throw new UnauthorizedException('Không thể làm mới token: ' + error.message);
    }
  }

  /**
   * Đăng xuất người dùng
   * @param userId ID của người dùng
   */
  async logout(userId: number): Promise<boolean> {
    await this.removeRefreshToken(userId);
    return true;
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
   * Tạo cả access token và refresh token
   * @param user Thông tin người dùng
   * @returns Object chứa access_token và refresh_token
   */
  async generateTokens(user: any) {
    const payload = { 
      sub: user.id, 
      username: user.username,
      email: user.email,
      isEmailConfirmed: user.isEmailConfirmed
    };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET', 'super-secret-key'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m')
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET', 'super-secret-refresh-key'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d')
      })
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  /**
   * Cập nhật refresh token cho người dùng
   * @param userId ID của người dùng
   * @param refreshToken Refresh token mới
   */
  async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
    // Hash refresh token trước khi lưu vào database để bảo mật hơn
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    
    // Thiết lập thời gian hết hạn cho refresh token (ví dụ: 7 ngày)
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 7);
    
    // Cập nhật vào database
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
      refreshTokenExpires: expiresDate,
    });
  }

  /**
   * Xóa refresh token của người dùng (khi đăng xuất)
   * @param userId ID của người dùng
   */
  async removeRefreshToken(userId: number): Promise<void> {
    await this.usersService.update(userId, {
      refreshToken: undefined,
      refreshTokenExpires: undefined,
    });
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
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m')
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