import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Module quản lý xác thực và phân quyền trong ứng dụng
 * Tích hợp các service, strategy và module liên quan đến JWT authentication
 */
@Module({
  imports: [
    // Import module người dùng để sử dụng UsersService
    UsersModule,
    
    // Cấu hình Passport cho phương thức xác thực
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    
    // Cấu hình JWT với các tùy chọn động từ ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'super-secret-key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1h'),
          audience: configService.get('JWT_AUDIENCE', 'tarot-app-users'),
          issuer: configService.get('JWT_ISSUER', 'tarot-app-api'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Service xử lý logic xác thực
    AuthService,
    
    // Strategy xử lý JWT token
    JwtStrategy,
  ],
  exports: [
    // Export AuthService để có thể sử dụng ở các module khác
    AuthService,
    
    // Export PassportModule để có thể sử dụng các Guard ở các module khác
    PassportModule,
  ],
})
export class AuthModule {}