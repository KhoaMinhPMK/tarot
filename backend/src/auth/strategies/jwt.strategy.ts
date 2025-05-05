import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';

/**
 * Strategy xác thực JWT token
 * Định nghĩa cách trích xuất và xác thực token từ request
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      // Trích xuất token từ header Authorization dạng Bearer
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // Không bỏ qua token hết hạn
      ignoreExpiration: false,
      
      // Khóa bí mật để xác thực token
      secretOrKey: configService.get('JWT_SECRET', 'super-secret-key'),
    });
  }

  /**
   * Xác thực và chuyển đổi thông tin từ JWT payload thành đối tượng người dùng
   * @param payload Dữ liệu được giải mã từ JWT
   * @returns Thông tin người dùng sẽ được gắn vào request
   */
  async validate(payload: any) {
    // Kiểm tra xem người dùng có tồn tại không
    const user = await this.usersService.findOneById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại hoặc đã bị xóa');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }
    
    // Trả về thông tin người dùng để gắn vào request
    return { 
      userId: payload.sub, 
      username: payload.username,
      email: payload.email,
      isEmailConfirmed: payload.isEmailConfirmed || false,
    };
  }
}