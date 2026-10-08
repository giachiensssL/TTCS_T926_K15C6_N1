import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserStatus } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersMailerService } from './users-mailer.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly usersMailer: UsersMailerService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.toLowerCase().trim();
    const temporaryPassword = this.generateTemporaryPassword();

    try {
      return await this.dataSource.transaction(async (manager) => {
        const users = manager.getRepository(User);
        const existingUser = await users.findOne({ where: { email } });

        if (existingUser) {
          throw new ConflictException('Email đã tồn tại trong hệ thống');
        }

        const user = users.create({
          fullName: createUserDto.fullName,
          email,
          phone: createUserDto.phone,
          role: createUserDto.role,
          password: await bcrypt.hash(temporaryPassword, 10),
          status: createUserDto.status ?? UserStatus.PENDING,
          mustChangePassword: true,
        });
        const savedUser = await users.save(user);

        await this.usersMailer.sendActivationEmail(
          savedUser.email,
          savedUser.fullName,
          temporaryPassword,
        );

        return {
          message: 'Tạo tài khoản và gửi email kích hoạt thành công',
          user: this.toSafeUser(savedUser),
        };
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('Email đã tồn tại trong hệ thống');
      }
      throw error;
    }
  }

  async findAll(queryParams: ListUsersQueryDto) {
    const query =
      this.userRepository.createQueryBuilder('user');

    const { search, role, status, page = 1, limit = 20 } = queryParams;

    if (search?.trim()) {
      query.andWhere(
        '(LOWER(user.fullName) LIKE LOWER(:search) ' +
          'OR LOWER(user.email) LIKE LOWER(:search) ' +
          'OR user.phone LIKE :search)',
        {
          search: `%${search.trim()}%`,
        },
      );
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    const currentPage = page;
    const pageSize = limit;

    const [users, total] = await query
      .orderBy('user.createdAt', 'DESC')
      .skip((currentPage - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data: users.map((user) => this.toSafeUser(user)),
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(
          total / pageSize,
        ),
      },
    };
  }

  async update(
    id: string,
    updateData: UpdateUserDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(
        'Không tìm thấy tài khoản',
      );
    }

    if (updateData.email) {
      const email =
        updateData.email.toLowerCase().trim();

      const existingUser = await this.userRepository.findOne({ where: { email } });

      if (
        existingUser &&
        existingUser.id !== id
      ) {
        throw new ConflictException(
          'Email đã tồn tại trong hệ thống',
        );
      }

      user.email = email;
    }

    if (updateData.fullName !== undefined) {
      user.fullName = updateData.fullName;
    }

    if (updateData.phone !== undefined) {
      user.phone = updateData.phone;
    }

    if (updateData.role !== undefined) {
      user.role = updateData.role;
    }

    if (updateData.status !== undefined) {
      user.status = updateData.status;
    }

    const savedUser =
      await this.userRepository.save(user);

    return {
      message: 'Cập nhật tài khoản thành công',
      user: this.toSafeUser(savedUser),
    };
  }

  private generateTemporaryPassword(): string {
    return `Tms@${randomBytes(12).toString('base64url')}`;
  }

  private toSafeUser(user: User): Omit<User, 'password'> {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}