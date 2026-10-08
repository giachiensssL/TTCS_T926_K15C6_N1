import { BadRequestException, Injectable } from '@nestjs/common'
import { UpdateProfileDto } from './profile.dto'

export interface Profile {
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  role: string
}

@Injectable()
export class ProfileService {
  private readonly profile: Profile = {
    fullName: 'Nguyễn Minh Anh',
    email: 'anh.nguyen@tms.edu.vn',
    phone: '0912345678',
    dateOfBirth: '2001-08-15',
    address: 'Quận 1, TP. Hồ Chí Minh',
    role: 'Học viên',
  }

  getProfile(): Profile {
    return { ...this.profile }
  }

  updateProfile(update: UpdateProfileDto): Profile {
    if (update.dateOfBirth && new Date(`${update.dateOfBirth}T00:00:00`) > new Date()) {
      throw new BadRequestException('Ngày sinh không được ở trong tương lai.')
    }

    this.profile.fullName = update.fullName
    this.profile.phone = update.phone
    this.profile.dateOfBirth = update.dateOfBirth ?? ''
    this.profile.address = update.address ?? ''

    return this.getProfile()
  }
}
