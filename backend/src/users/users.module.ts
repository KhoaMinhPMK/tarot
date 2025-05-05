import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

/**
 * Module quản lý người dùng
 * Cung cấp các dịch vụ và controller làm việc với thông tin người dùng
 */
@Module({
  imports: [
    // Đăng ký entity User với TypeORM
    TypeOrmModule.forFeature([User])
  ],
  // Khai báo các controller của module này
  controllers: [UsersController],
  // Khai báo các service cung cấp bởi module này
  providers: [UsersService],
  // Export UsersService để có thể sử dụng ở các module khác (như AuthModule)
  exports: [UsersService],
})
export class UsersModule {}