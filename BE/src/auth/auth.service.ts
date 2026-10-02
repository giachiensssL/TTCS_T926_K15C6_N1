import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, ip: string): Promise<{ accessToken: string; refreshToken: string; role: string }> {
    const { email, password } = dto;
    const user = this.usersService.findByEmail(email);

    if (!user) {
      await this.usersService.dummyCompare(password);
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu không đúng.',
      });
    }

    if (user.status === 'DISABLED') {
      throw new ForbiddenException({
        code: 'AUTH_ACCOUNT_DISABLED',
        message: 'Tài khoản đã bị vô hiệu hoá. Vui lòng liên hệ quản trị viên.',
      });
    }

    if (user.lockUntil) {
      if (user.lockUntil > new Date()) {
        throw new HttpException(
          {
            code: 'AUTH_ACCOUNT_LOCKED',
            message: 'Tài khoản tạm thời bị khoá.',
            lockedUntil: user.lockUntil.toISOString(),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      } else {
        this.usersService.resetFailed(user.id);
      }
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      this.usersService.incrementFailed(user.id);
      const refreshed = this.usersService.findById(user.id)!;

      if (refreshed.lockUntil && refreshed.lockUntil > new Date()) {
        throw new HttpException(
          {
            code: 'AUTH_ACCOUNT_LOCKED',
            message: 'Tài khoản tạm thời bị khoá.',
            lockedUntil: refreshed.lockUntil.toISOString(),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu không đúng.',
      });
    }

    this.usersService.resetFailed(user.id);

    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, jti: crypto.randomUUID() },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken, role: user.role };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException({
        code: 'AUTH_TOKEN_MISSING',
        message: 'Không tìm thấy refresh token.',
      });
    }
    try {
      const payload = this.jwtService.verify<{ sub: number; jti: string }>(refreshToken);
      const user = this.usersService.findById(payload.sub);
      if (!user) throw new Error();

      const newAccessToken = this.jwtService.sign({ sub: user.id, role: user.role }, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign({ sub: user.id, jti: crypto.randomUUID() }, { expiresIn: '7d' });
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException({
        code: 'AUTH_TOKEN_INVALID',
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
      });
    }
  }
}

