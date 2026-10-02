import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser = require('cookie-parser');
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Cookie parser (cho HttpOnly refresh token) ──────────────────────────
  app.use(cookieParser());

  // ── Global validation pipe ───────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: false,  // Trả hết lỗi cùng một lúc
    }),
  );

  // ── Global prefix: tất cả route bắt đầu bằng /api ─────────────────────
  app.setGlobalPrefix('api');

  // ── CORS: cho phép FE dev server ────────────────────────────────────────
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,   // Cần thiết để gửi cookie
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`\n🚀  TMS API running at http://localhost:${port}/api`);
  console.log(`🧪  Test login: POST http://localhost:${port}/api/auth/login`);
  console.log(`\nTest accounts (password: Admin@1234):`);
  console.log(`  admin@tms.vn       → ADMIN`);
  console.log(`  manager@tms.vn     → TRAINING_MANAGER`);
  console.log(`  teacher@tms.vn     → TEACHER`);
  console.log(`  assistant@tms.vn   → ASSISTANT`);
  console.log(`  consultant@tms.vn  → CONSULTANT`);
  console.log(`  accountant@tms.vn  → ACCOUNTANT`);
  console.log(`  student@tms.vn     → STUDENT`);
  console.log(`  disabled@tms.vn    → DISABLED (test AC-05)\n`);
}

bootstrap();
