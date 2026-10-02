import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export type UserRole =
  | 'ADMIN'
  | 'TRAINING_MANAGER'
  | 'TEACHER'
  | 'ASSISTANT'
  | 'CONSULTANT'
  | 'ACCOUNTANT'
  | 'STUDENT'
  | 'GUEST';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: 'ACTIVE' | 'DISABLED';
  failedAttempts: number;
  lockUntil: Date | null;
}

// ---------------------------------------------------------------------------
// Tài khoản mặc định để test  (mật khẩu: Admin@1234)
// Khi chuyển sang PostgreSQL: swap findByEmail/findById sang TypeORM repo
// ---------------------------------------------------------------------------
async function makeHash(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

@Injectable()
export class UsersService {
  private users: User[] = [];

  async onModuleInit() {
    // Seed in-memory store với hash thực
    const hash = await makeHash('Admin@1234');
    this.users = [
      { id: 1, email: 'admin@tms.vn',       passwordHash: hash, role: 'ADMIN',            status: 'ACTIVE', failedAttempts: 0, lockUntil: null },
      { id: 2, email: 'manager@tms.vn',     passwordHash: hash, role: 'TRAINING_MANAGER', status: 'ACTIVE', failedAttempts: 0, lockUntil: null },
      { id: 3, email: 'teacher@tms.vn',     passwordHash: hash, role: 'TEACHER',          status: 'ACTIVE', failedAttempts: 0, lockUntil: null },
      { id: 4, email: 'assistant@tms.vn',   passwordHash: hash, role: 'ASSISTANT',        status: 'ACTIVE', failedAttempts: 0, lockUntil: null },
      { id: 5, email: 'consultant@tms.vn',  passwordHash: hash, role: 'CONSULTANT',       status: 'ACTIVE', failedAttempts: 0, lockUntil: null },
      { id: 6, email: 'accountant@tms.vn',  passwordHash: hash, role: 'ACCOUNTANT',       status: 'ACTIVE', failedAttempts: 0, lockUntil: null },
      { id: 7, email: 'student@tms.vn',     passwordHash: hash, role: 'STUDENT',          status: 'ACTIVE', failedAttempts: 0, lockUntil: null },
      { id: 8, email: 'disabled@tms.vn',    passwordHash: hash, role: 'STUDENT',          status: 'DISABLED', failedAttempts: 0, lockUntil: null },
    ];
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  incrementFailed(id: number): void {
    const u = this.findById(id);
    if (!u) return;
    u.failedAttempts += 1;
    if (u.failedAttempts >= 5) {
      u.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
    }
  }

  resetFailed(id: number): void {
    const u = this.findById(id);
    if (!u) return;
    u.failedAttempts = 0;
    u.lockUntil = null;
  }

  /** So sánh hash giả để đồng đều thời gian khi email không tồn tại (chống Timing Attack) */
  async dummyCompare(password: string): Promise<void> {
    const dummyHash = '$2b$12$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    await bcrypt.compare(password, dummyHash).catch(() => {});
  }
}
