import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserStatus } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.toLowerCase().trim();

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email đã tồn tại trong hệ thống',
      );
    }

    const temporaryPassword =
      this.generateTemporaryPassword();

    const hashedPassword = await bcrypt.hash(
      temporaryPassword,
      10,
    );

    const user = this.userRepository.create({
      ...createUserDto,
      email,
      password: hashedPassword,
      status:
        createUserDto.status ?? UserStatus.PENDING,
      mustChangePassword: true,
    });

    const savedUser =
      await this.userRepository.save(user);

    return {
      message: 'Tạo tài khoản thành công',
      user: {
        id: savedUser.id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        phone: savedUser.phone,
        role: savedUser.role,
        status: savedUser.status,
        mustChangePassword:
          savedUser.mustChangePassword,
      },
      temporaryPassword,
    };
  }

  async findAll(
    search?: string,
    role?: string,
    status?: string,
    page = 1,
    limit = 20,
  ) {
    const query =
      this.userRepository.createQueryBuilder('user');

    if (search) {
      query.andWhere(
        '(LOWER(user.fullName) LIKE LOWER(:search) ' +
          'OR LOWER(user.email) LIKE LOWER(:search) ' +
          'OR user.phone LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (role) {
      query.andWhere(
        'user.role = :role',
        { role },
      );
    }

    if (status) {
      query.andWhere(
        'user.status = :status',
        { status },
      );
    }

    const currentPage =
      Number(page) > 0 ? Number(page) : 1;

    const pageSize =
      Number(limit) > 0 ? Number(limit) : 20;

    const [users, total] = await query
      .orderBy('user.createdAt', 'DESC')
      .skip((currentPage - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const safeUsers = users.map(
      ({ password, ...user }) => user,
    );

    return {
      data: safeUsers,
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
    updateData: Partial<CreateUserDto>,
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

      const existingUser =
        await this.userRepository.findOne({
          where: { email },
        });

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

    const { password, ...safeUser } = savedUser;

    return {
      message: 'Cập nhật tài khoản thành công',
      user: safeUser,
    };
  }

  private generateTemporaryPassword(): string {
    const random = Math.random()
      .toString(36)
      .slice(-8);

    return `Tms@${random}`;
  }
}