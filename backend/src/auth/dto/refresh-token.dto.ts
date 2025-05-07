import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO cho việc làm mới token
 * Chứa refresh token dùng để tạo access token mới
 */
export class RefreshTokenDto {
  @ApiProperty({ 
    description: 'Refresh token để làm mới access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString({ message: 'Refresh token phải là chuỗi' })
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  refreshToken: string;
}
