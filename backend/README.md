# Tarot App Backend API

## Giới thiệu

Backend API cho ứng dụng Tarot được xây dựng trên framework NestJS, một framework mạnh mẽ cho Node.js được lấy cảm hứng từ Angular. API này cung cấp các chức năng xác thực, quản lý người dùng và các endpoint cơ bản cho ứng dụng.

## Công nghệ sử dụng

- **NestJS** - Framework backend chính
- **TypeORM** - ORM (Object-Relational Mapping) để làm việc với cơ sở dữ liệu
- **SQLite** - Hệ quản trị cơ sở dữ liệu (có thể thay thế bằng PostgreSQL trong môi trường production)
- **JWT** (JSON Web Tokens) - Xác thực và phân quyền người dùng
- **Bcrypt** - Mã hóa mật khẩu
- **Class-validator & Class-transformer** - Kiểm tra và chuyển đổi dữ liệu
- **Swagger** - Tài liệu API tự động

## Cấu trúc dự án

```
src/
├── app.controller.ts       # Controller chính của ứng dụng
├── app.module.ts           # Module chính tích hợp tất cả các module khác
├── app.service.ts          # Service chính cung cấp các chức năng chung
├── main.ts                 # Điểm khởi đầu của ứng dụng
├── auth/                   # Module xác thực
│   ├── auth.controller.ts  # Xử lý các request liên quan đến xác thực
│   ├── auth.module.ts      # Cấu hình module xác thực
│   ├── auth.service.ts     # Logic xử lý xác thực
│   ├── dto/                # Data Transfer Objects cho xác thực
│   ├── guards/             # Guards bảo vệ các route
│   └── strategies/         # Các chiến lược xác thực JWT
├── common/                 # Module chung
│   ├── filters/            # Bộ lọc xử lý ngoại lệ
│   └── interceptors/       # Interceptors ghi log và xử lý dữ liệu
└── users/                  # Module quản lý người dùng
    ├── users.controller.ts # Xử lý các request liên quan đến người dùng
    ├── users.module.ts     # Cấu hình module người dùng
    ├── users.service.ts    # Logic xử lý dữ liệu người dùng
    ├── dto/                # Data Transfer Objects cho người dùng
    └── entities/           # Entities định nghĩa các bảng dữ liệu
```

## Tính năng

### Quản lý người dùng
- Đăng ký người dùng mới
- Đăng nhập với username hoặc email
- Xác thực email
- Đặt lại mật khẩu
- Cập nhật thông tin cá nhân
- Xem danh sách người dùng (admin)
- Xóa người dùng (admin)

### Xác thực và bảo mật
- JWT Authentication
- Hash mật khẩu an toàn với bcrypt
- Bảo vệ route với Guards
- Giới hạn tần suất request (Rate limiting)
- Xử lý ngoại lệ và mã trạng thái HTTP thống nhất

### Chức năng hệ thống
- Thông tin về hệ thống
- Kiểm tra trạng thái hoạt động
- Ghi log chi tiết

## API Endpoints

### App
- `GET /` - Thông tin tổng quan về API
- `GET /health` - Kiểm tra trạng thái hoạt động
- `GET /secure` - Endpoint được bảo vệ để kiểm tra xác thực

### Auth
- `POST /auth/register` - Đăng ký người dùng mới
- `POST /auth/login` - Đăng nhập
- `GET /auth/profile` - Xem thông tin người dùng hiện tại
- `GET /auth/confirm-email` - Xác nhận email
- `POST /auth/forgot-password` - Yêu cầu đặt lại mật khẩu
- `POST /auth/reset-password` - Đặt lại mật khẩu

### Users
- `GET /users` - Lấy danh sách người dùng (admin)
- `GET /users/:id` - Lấy thông tin chi tiết người dùng
- `PUT /users/:id` - Cập nhật thông tin người dùng
- `DELETE /users/:id` - Xóa người dùng (admin)

## Tài liệu API

API được tài liệu hóa đầy đủ với Swagger tại đường dẫn `/api/docs`. Mỗi endpoint đều có mô tả chi tiết, request body, response và mã trạng thái.

## Cài đặt và chạy dự án

### Yêu cầu

- Node.js (v14 trở lên)
- NPM hoặc Yarn

### Các bước cài đặt

1. Clone dự án:
```bash
git clone <repository-url>
cd tarot_app/backend
```

2. Cài đặt các gói phụ thuộc:
```bash
npm install
```

3. Tạo file môi trường:
```bash
cp .env.example .env
```

4. Chạy ứng dụng trong chế độ phát triển:
```bash
npm run start:dev
```

5. Truy cập Swagger UI tại:
```
http://localhost:3000/api/docs
```

### Chạy với cơ sở dữ liệu PostgreSQL

Để sử dụng PostgreSQL thay vì SQLite, hãy sửa file `app.module.ts` và cập nhật các thông tin kết nối trong file .env:

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT') ? parseInt(configService.get('DB_PORT'), 10) : 5432,
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'postgres'),
    database: configService.get('DB_DATABASE', 'tarot_app'),
    entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
    synchronize: configService.get('NODE_ENV') !== 'production',
    logging: configService.get('DATABASE_LOGGING', 'false') === 'true',
  }),
}),
```

## Triển khai

### Biên dịch dự án
```bash
npm run build
```

### Chạy ứng dụng trong môi trường production
```bash
npm run start:prod
```

## Bảo mật

- Lưu ý rằng `synchronize: true` chỉ nên được sử dụng trong môi trường phát triển, không nên sử dụng trong môi trường sản xuất để tránh mất dữ liệu
- JWT secret và các thông tin nhạy cảm khác nên được lưu trữ trong biến môi trường
- Đảm bảo cài đặt CORS chính xác cho domain frontend của bạn

## Tác giả

- [Tên tác giả]

## Giấy phép

[Thông tin giấy phép]
