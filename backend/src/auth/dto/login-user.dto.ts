import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO cho việc đăng nhập người dùng
 * Hỗ trợ đăng nhập bằng username hoặc email kết hợp với mật khẩu
 */
export class LoginUserDto {
  @ApiProperty({ 
    description: 'Tên đăng nhập hoặc email để đăng nhập',
    example: 'user123 hoặc user@example.com'
  })
  @IsString({ message: 'Tên đăng nhập hoặc email phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên đăng nhập hoặc email không được để trống' })
  usernameOrEmail: string;

  @ApiProperty({ 
    description: 'Mật khẩu đăng nhập', 
    example: 'Password123!'
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}