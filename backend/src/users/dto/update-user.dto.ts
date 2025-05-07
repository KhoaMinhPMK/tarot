import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength, IsUrl, IsBoolean, IsDate } from 'class-validator';

/**
 * DTO cho việc cập nhật thông tin người dùng
 * Tất cả các trường đều là optional vì chỉ cập nhật những trường được gửi lên
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Email của người dùng',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Tên đầy đủ của người dùng',
    example: 'Nguyễn Văn A',
  })
  @IsString({ message: 'Tên đầy đủ phải là chuỗi' })
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'URL ảnh đại diện',
    example: 'https://example.com/avatar.jpg',
  })
  @IsUrl({}, { message: 'URL ảnh đại diện không hợp lệ' })
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái hoạt động',
    example: true,
  })
  @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Mật khẩu mới',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'Mật khẩu hiện tại (bắt buộc khi thay đổi mật khẩu)',
    example: 'currentPassword123',
  })
  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi' })
  @IsOptional()
  currentPassword?: string;

  /**
   * Các trường sau đây được sử dụng nội bộ bởi AuthService
   * Không được hiển thị trong API docs và không thể được gửi bởi client
   */
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsDate()
  @IsOptional()
  refreshTokenExpires?: Date;
}