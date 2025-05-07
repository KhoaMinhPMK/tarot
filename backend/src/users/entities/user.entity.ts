import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';

/**
 * Entity User - Đại diện cho bảng "user" trong cơ sở dữ liệu
 * Lưu trữ thông tin của người dùng trong hệ thống
 */
@Entity('users') // Tên bảng trong database
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // Loại trừ trường này khi chuyển đổi thành JSON
  @ApiHideProperty() // Ẩn trường này trong Swagger docs
  password: string;

  @Column({ nullable: true, length: 100 })
  fullName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailConfirmed: boolean;

  @Column({ nullable: true })
  emailConfirmationToken: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column({ nullable: true })
  @Exclude() // Loại trừ trường này khi chuyển đổi thành JSON
  @ApiHideProperty() // Ẩn trường này trong Swagger docs
  refreshToken: string;

  @Column({ nullable: true })
  @Exclude() // Loại trừ trường này khi chuyển đổi thành JSON
  @ApiHideProperty() // Ẩn trường này trong Swagger docs
  refreshTokenExpires: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeInsert()
  updateDates() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  updateUpdatedAt() {
    this.updatedAt = new Date();
  }
  
  /**
   * Phương thức kiểm tra xem người dùng có quyền admin không
   * Có thể mở rộng để tích hợp hệ thống phân quyền chi tiết hơn
   */
  hasRole(role: string): boolean {
    // Mở rộng sau với hệ thống phân quyền chi tiết hơn
    return role === 'admin' && this.username === 'admin';
  }
}