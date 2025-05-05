import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, Matches, MaxLength } from 'class-validator';

/**
 * DTO cho việc đăng ký người dùng mới
 * Chứa các trường thông tin cần thiết để tạo tài khoản mới
 */
export class RegisterUserDto {
  @ApiProperty({ 
    description: 'Tên đăng nhập của người dùng, dùng để đăng nhập', 
    minLength: 3,
    maxLength: 50,
    example: 'user123'
  })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  @MaxLength(50, { message: 'Tên đăng nhập không được vượt quá 50 ký tự' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { 
    message: 'Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới'
  })
  username: string;

  @ApiProperty({ 
    description: 'Email của người dùng, phải là định dạng email hợp lệ',
    example: 'user@example.com' 
  })
  @IsEmail({}, { message: 'Vui lòng cung cấp địa chỉ email hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ 
    description: 'Mật khẩu của người dùng, cần có độ phức tạp nhất định', 
    minLength: 6,
    example: 'Password123!' 
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&#]{6,}$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
  })
  password: string;

  @ApiProperty({ 
    description: 'Tên đầy đủ của người dùng', 
    required: false,
    example: 'Nguyễn Văn A' 
  })
  @IsString({ message: 'Tên đầy đủ phải là chuỗi' })
  @IsOptional()
  fullName?: string;
}