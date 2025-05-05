import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Put,
  Query,
  ParseIntPipe,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * Controller quản lý người dùng
 * Cung cấp các endpoint để xem và quản lý thông tin người dùng
 */
@ApiTags('3-users')
@Controller('users')
@UseGuards(JwtAuthGuard) // Tất cả endpoint của controller này đều yêu cầu xác thực
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Lấy danh sách người dùng (phân trang)
   * Chỉ admin mới có quyền truy cập endpoint này
   * @param page Số trang (bắt đầu từ 1)
   * @param limit Số lượng kết quả mỗi trang
   * @returns Danh sách người dùng và thông tin phân trang
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách người dùng (chỉ admin)' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Số trang (bắt đầu từ 1)' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Số lượng kết quả mỗi trang' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách người dùng thành công' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không đủ quyền - yêu cầu quyền admin' })
  async findAll(
    @Req() req, 
    @Query('page') page: number = 1, 
    @Query('limit') limit: number = 10,
  ) {
    // Kiểm tra quyền admin
    // Trong thực tế, bạn cần triển khai hệ thống phân quyền đầy đủ
    const user = await this.usersService.findOneById(req.user.userId);
    if (!user || !user.hasRole('admin')) {
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }

    return this.usersService.findAll(page, limit);
  }

  /**
   * Lấy thông tin chi tiết của một người dùng
   * Người dùng chỉ có thể xem thông tin của chính mình, trừ khi là admin
   * @param id ID của người dùng
   * @returns Thông tin chi tiết của người dùng
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một người dùng' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID của người dùng' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin người dùng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 403, description: 'Không được phép xem thông tin của người dùng khác' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    // Kiểm tra xem người dùng có quyền xem thông tin này không
    if (id !== req.user.userId) {
      // Kiểm tra xem người dùng hiện tại có phải admin không
      const requestingUser = await this.usersService.findOneById(req.user.userId);
      if (!requestingUser || !requestingUser.hasRole('admin')) {
        throw new ForbiddenException('Bạn không có quyền xem thông tin của người dùng khác');
      }
    }

    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new BadRequestException(`Không tìm thấy người dùng với ID: ${id}`);
    }

    // Loại bỏ các thông tin nhạy cảm
    const { password, emailConfirmationToken, passwordResetToken, passwordResetExpires, ...result } = user;
    return result;
  }

  /**
   * Cập nhật thông tin người dùng
   * Người dùng chỉ có thể cập nhật thông tin của chính mình, trừ khi là admin
   * @param id ID của người dùng
   * @param updateUserDto Dữ liệu cần cập nhật
   * @returns Thông tin người dùng sau khi cập nhật
   */
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID của người dùng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thông tin người dùng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 403, description: 'Không được phép cập nhật thông tin của người dùng khác' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    // Kiểm tra xem người dùng có quyền cập nhật thông tin này không
    if (id !== req.user.userId) {
      // Kiểm tra xem người dùng hiện tại có phải admin không
      const requestingUser = await this.usersService.findOneById(req.user.userId);
      if (!requestingUser || !requestingUser.hasRole('admin')) {
        throw new ForbiddenException('Bạn không có quyền cập nhật thông tin của người dùng khác');
      }
    }

    // Nếu muốn thay đổi mật khẩu, cần xác thực mật khẩu hiện tại trước
    if (updateUserDto.password && id === req.user.userId) {
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException('Vui lòng cung cấp mật khẩu hiện tại để thay đổi mật khẩu');
      }

      const user = await this.usersService.findOneById(id);
      if (!user) {
        throw new BadRequestException(`Không tìm thấy người dùng với ID: ${id}`);
      }

      // So sánh mật khẩu hiện tại
      const passwordValid = await bcrypt.compare(updateUserDto.currentPassword, user.password);
      if (!passwordValid) {
        throw new BadRequestException('Mật khẩu hiện tại không chính xác');
      }

      // Hash mật khẩu mới
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Loại bỏ trường currentPassword trước khi cập nhật
    const { currentPassword, ...updateData } = updateUserDto;
    
    const updated = await this.usersService.update(id, updateData);
    
    // Loại bỏ các thông tin nhạy cảm
    const { password, emailConfirmationToken, passwordResetToken, passwordResetExpires, ...result } = updated;
    return result;
  }

  /**
   * Xóa người dùng
   * Chỉ admin mới có thể xóa người dùng
   * @param id ID của người dùng cần xóa
   * @returns Thông báo xóa thành công
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa người dùng (chỉ admin)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID của người dùng' })
  @ApiResponse({ status: 200, description: 'Xóa người dùng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 403, description: 'Không đủ quyền - yêu cầu quyền admin' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    // Kiểm tra quyền admin
    const requestingUser = await this.usersService.findOneById(req.user.userId);
    if (!requestingUser || !requestingUser.hasRole('admin')) {
      throw new ForbiddenException('Bạn không có quyền xóa người dùng');
    }

    // Không cho phép tự xóa tài khoản admin
    if (id === req.user.userId) {
      throw new ForbiddenException('Không thể xóa tài khoản của chính mình');
    }

    const result = await this.usersService.remove(id);
    
    if (!result) {
      throw new BadRequestException(`Không tìm thấy người dùng với ID: ${id}`);
    }
    
    return {
      message: 'Xóa người dùng thành công',
      id
    };
  }
}