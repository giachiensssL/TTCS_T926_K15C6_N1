import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async changePassword(
    userId: number,
    dto: ChangePasswordDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepository.save(user);

    console.log('BEFORE TOKEN VERSION:', user.tokenVersion);

    await this.userRepository.increment(
      { id: user.id },
      'tokenVersion',
      1,
    );

    const updatedUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    console.log(
      'AFTER TOKEN VERSION:',
      updatedUser?.tokenVersion,
    );

    return {
      message: 'Đổi mật khẩu thành công',
    };
  }
}