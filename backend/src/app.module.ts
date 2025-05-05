import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as path from 'path';

/**
 * Module chính của ứng dụng, tích hợp và cấu hình tất cả các module khác
 */
@Module({
  imports: [
    // Module cấu hình cho các biến môi trường
    ConfigModule.forRoot({
      isGlobal: true, // Khả dụng trong toàn bộ ứng dụng
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Tải file env dựa vào môi trường
    }),
    
    // Module giao tiếp với cơ sở dữ liệu
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get('DATABASE_NAME', 'tarot_app.sqlite'),
        entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: configService.get('NODE_ENV') !== 'production', // Chỉ đồng bộ trong môi trường dev
        logging: configService.get('DATABASE_LOGGING', 'false') === 'true',
        autoLoadEntities: true,
      }),
    }),

    // Module giới hạn số lượng requests trong khoảng thời gian nhất định (chống tấn công bruteforce)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL', 60), // Thời gian giới hạn (giây)
          limit: configService.get('THROTTLE_LIMIT', 10), // Số lượng requests tối đa
        },
      ],
    }),

    // Các module chức năng
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Filter toàn cục xử lý tất cả các exception
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Interceptor ghi log tất cả các request và response
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Guard giới hạn số lượng request
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
