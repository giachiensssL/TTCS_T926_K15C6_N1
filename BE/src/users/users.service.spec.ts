import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { User, UserRole, UserStatus } from './user.entity';
import { UsersService } from './users.service';
import { UsersMailerService } from './users-mailer.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Partial<Repository<User>>>;
  let dataSource: { transaction: jest.Mock };
  let mailer: { sendActivationEmail: jest.Mock };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn((values) => values as User),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn((callback: (manager: unknown) => unknown) =>
        callback({
          getRepository: () => repository,
        }),
      ),
    };
    mailer = { sendActivationEmail: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
        { provide: DataSource, useValue: dataSource },
        { provide: UsersMailerService, useValue: mailer },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates the account and emails a temporary password without returning it', async () => {
    const user = {
      id: 'user-id',
      fullName: 'Nguyen Van A',
      email: 'person@example.com',
      phone: '0900000000',
      role: UserRole.STUDENT,
      status: UserStatus.PENDING,
      mustChangePassword: true,
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    repository.findOne?.mockResolvedValue(null);
    repository.save?.mockResolvedValue(user);

    const result = await service.create({
      fullName: 'Nguyen Van A',
      email: ' Person@Example.com ',
      phone: '0900000000',
      role: UserRole.STUDENT,
    });

    expect(mailer.sendActivationEmail).toHaveBeenCalledWith(
      user.email,
      user.fullName,
      expect.stringMatching(/^Tms@/),
    );
    expect(result.user).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('temporaryPassword');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'person@example.com',
        status: UserStatus.PENDING,
        mustChangePassword: true,
      }),
    );
  });

  it('rejects an email already registered', async () => {
    repository.findOne?.mockResolvedValue({ id: 'existing-id' } as User);

    await expect(
      service.create({
        fullName: 'Nguyen Van A',
        email: 'person@example.com',
        role: UserRole.STUDENT,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(mailer.sendActivationEmail).not.toHaveBeenCalled();
  });
});
