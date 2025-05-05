import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Tạo instance của ứng dụng NestJS
  const app = await NestFactory.create(AppModule, {
    // Bật tính năng ghi log ứng dụng
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Tạo instance Logger
  const logger = new Logger('Bootstrap');
  
  // Bật CORS cho phép frontend có thể gọi API
  app.enableCors({
    origin: true, // Trong môi trường production, hãy chỉ định chính xác domain được phép
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Thiết lập prefix cho tất cả API endpoints (ví dụ: /api/auth/login)
  app.setGlobalPrefix('api');
  
  // Thiết lập global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu có thuộc tính không được định nghĩa
      transform: true, // Tự động chuyển đổi kiểu dữ liệu theo DTO
      transformOptions: {
        enableImplicitConversion: true, // Cho phép chuyển đổi kiểu ngầm định
      },
    }),
  );

  // Thiết lập Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Tarot App API')
    .setDescription('API cho hệ thống xác thực và quản lý người dùng của ứng dụng Tarot')
    .setVersion('1.0')
    .addTag('auth', 'Các API liên quan đến xác thực')
    .addTag('users', 'Các API liên quan đến người dùng')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT token của bạn',
        in: 'header',
      },
      'access-token', // Tên này sẽ được sử dụng cho @ApiBearerAuth() decorator
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  // Custom options cho Swagger UI
  const customOptions = {
    swaggerOptions: {
      persistAuthorization: true, // Giữ token authorization giữa các refresh
    },
    customSiteTitle: 'Tarot App API Docs',
  };
  SwaggerModule.setup('api/docs', app, document, customOptions);

  // Khởi động server tại cổng 3000 hoặc từ biến môi trường
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`Ứng dụng đang chạy tại: http://localhost:${port}`);
  logger.log(`Swagger UI có thể truy cập tại: http://localhost:${port}/api/docs`);
}
bootstrap();
