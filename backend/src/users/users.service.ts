import { Injectable, ConflictException, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
// Sử dụng đường dẫn tuyệt đối để giải quyết vấn đề
import { UpdateUserDto } from '../users/dto/update-user.dto';
import * as crypto from 'crypto';

/**
 * Service quản lý người dùng
 * Cung cấp các phương thức để làm việc với dữ liệu người dùng
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Tìm người dùng theo ID
   * @param id ID của người dùng
   * @returns Thông tin người dùng hoặc null nếu không tìm thấy
   */
  async findOneById(id: number): Promise<User | null> {
    try {
      return this.usersRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(`Lỗi khi tìm người dùng theo ID ${id}:`, error.stack);
      throw new InternalServerErrorException('Không thể tìm người dùng');
    }
  }

  /**
   * Tìm người dùng theo username
   * @param username Username của người dùng
   * @returns Thông tin người dùng hoặc null nếu không tìm thấy
   */
  async findOneByUsername(username: string): Promise<User | null> {
    try {
      return this.usersRepository.findOneBy({ username });
    } catch (error) {
      this.logger.error(`Lỗi khi tìm người dùng theo username ${username}:`, error.stack);
      throw new InternalServerErrorException('Không thể tìm người dùng');
    }
  }

  /**
   * Tìm người dùng theo email
   * @param email Email của người dùng
   * @returns Thông tin người dùng hoặc null nếu không tìm thấy
   */
  async findOneByEmail(email: string): Promise<User | null> {
    try {
      return this.usersRepository.findOneBy({ email });
    } catch (error) {
      this.logger.error(`Lỗi khi tìm người dùng theo email ${email}:`, error.stack);
      throw new InternalServerErrorException('Không thể tìm người dùng');
    }
  }

  /**
   * Tạo người dùng mới
   * @param userData Dữ liệu người dùng
   * @returns Thông tin người dùng đã tạo
   */
  async create(userData: Partial<User>): Promise<User> {
    try {
      // Kiểm tra username đã tồn tại chưa
      if (userData.username) {
        const existingUserByUsername = await this.findOneByUsername(userData.username);
        if (existingUserByUsername) {
          throw new ConflictException('Tên đăng nhập đã được sử dụng');
        }
      }

      // Kiểm tra email đã tồn tại chưa
      if (userData.email) {
        const existingUserByEmail = await this.findOneByEmail(userData.email);
        if (existingUserByEmail) {
          throw new ConflictException('Email đã được sử dụng');
        }
      }

      // Tạo token xác thực email (nếu cần)
      if (userData.isEmailConfirmed === false) {
        userData.emailConfirmationToken = crypto.randomBytes(32).toString('hex');
      }

      // Tạo và lưu người dùng mới
      const user = this.usersRepository.create(userData);
      return this.usersRepository.save(user);
    } catch (error) {
      // Nếu lỗi không phải là ConflictException (đã xử lý ở trên), thì ghi log và báo lỗi
      if (!(error instanceof ConflictException)) {
        this.logger.error('Lỗi khi tạo người dùng mới:', error.stack);
        throw new InternalServerErrorException('Không thể tạo người dùng mới');
      }
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * @param id ID của người dùng cần cập nhật
   * @param updateUserDto Dữ liệu cần cập nhật
   * @returns Thông tin người dùng sau khi cập nhật
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      // Tìm người dùng
      const user = await this.findOneById(id);
      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
      }

      // Kiểm tra email mới đã được sử dụng chưa
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.findOneByEmail(updateUserDto.email);
        if (existingUser) {
          throw new ConflictException('Email đã được sử dụng');
        }
        // Nếu email thay đổi, yêu cầu xác thực lại
        user.isEmailConfirmed = false;
        user.emailConfirmationToken = crypto.randomBytes(32).toString('hex');
      }

      // Cập nhật thông tin
      Object.assign(user, updateUserDto);
      
      // Lưu vào cơ sở dữ liệu
      return this.usersRepository.save(user);
    } catch (error) {
      // Nếu lỗi không phải là NotFoundException hoặc ConflictException, ghi log và báo lỗi
      if (!(error instanceof NotFoundException || error instanceof ConflictException)) {
        this.logger.error(`Lỗi khi cập nhật người dùng với ID ${id}:`, error.stack);
        throw new InternalServerErrorException('Không thể cập nhật thông tin người dùng');
      }
      throw error;
    }
  }

  /**
   * Xác nhận email của người dùng
   * @param token Token xác nhận email
   * @returns True nếu xác nhận thành công, False nếu thất bại
   */
  async confirmEmail(token: string): Promise<boolean> {
    try {
      // Tìm người dùng với token xác nhận
      const user = await this.usersRepository.findOneBy({ emailConfirmationToken: token });
      
      if (!user) {
        return false;
      }
      
      // Cập nhật trạng thái xác nhận email
      user.isEmailConfirmed = true;
      user.emailConfirmationToken = null as unknown as string; // Type assertion để xử lý lỗi
      
      // Lưu vào cơ sở dữ liệu
      await this.usersRepository.save(user);
      return true;
    } catch (error) {
      this.logger.error(`Lỗi khi xác nhận email với token ${token}:`, error.stack);
      throw new InternalServerErrorException('Không thể xác nhận email');
    }
  }

  /**
   * Tạo token đặt lại mật khẩu
   * @param email Email của người dùng cần đặt lại mật khẩu
   * @returns Token đặt lại mật khẩu hoặc null nếu không tìm thấy người dùng
   */
  async createPasswordResetToken(email: string): Promise<string | null> {
    try {
      // Tìm người dùng theo email
      const user = await this.findOneByEmail(email);
      if (!user) {
        return null;
      }
      
      // Tạo token đặt lại mật khẩu và thời gian hết hạn
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = resetToken;
      
      // Token hết hạn sau 1 giờ
      const expiresDate = new Date();
      expiresDate.setHours(expiresDate.getHours() + 1);
      user.passwordResetExpires = expiresDate;
      
      // Lưu vào cơ sở dữ liệu
      await this.usersRepository.save(user);
      return resetToken;
    } catch (error) {
      this.logger.error(`Lỗi khi tạo token đặt lại mật khẩu cho email ${email}:`, error.stack);
      throw new InternalServerErrorException('Không thể tạo token đặt lại mật khẩu');
    }
  }

  /**
   * Xóa người dùng
   * @param id ID của người dùng cần xóa
   * @returns True nếu xóa thành công, False nếu không tìm thấy người dùng
   */
  async remove(id: number): Promise<boolean> {
    try {
      const result = await this.usersRepository.delete(id);
      return result.affected != null && result.affected > 0;
    } catch (error) {
      this.logger.error(`Lỗi khi xóa người dùng với ID ${id}:`, error.stack);
      throw new InternalServerErrorException('Không thể xóa người dùng');
    }
  }

  /**
   * Lấy danh sách người dùng với phân trang
   * @param page Số trang (mặc định là 1)
   * @param limit Số lượng kết quả mỗi trang (mặc định là 10)
   * @returns Danh sách người dùng và thông tin phân trang
   */
  async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number, page: number, limit: number }> {
    try {
      const [users, total] = await this.usersRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });
      
      return {
        users,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi lấy danh sách người dùng:`, error.stack);
      throw new InternalServerErrorException('Không thể lấy danh sách người dùng');
    }
  }
}