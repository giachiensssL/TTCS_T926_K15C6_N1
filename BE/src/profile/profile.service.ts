import { BadRequestException, Injectable } from '@nestjs/common'
import { UpdateProfileDto } from './profile.dto'

export interface Profile {
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  role: string
  avatar: string
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
    avatar: '',
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
  updateAvatar(
  avatar: string,
  mimeType: string,
  size: number,
): Profile {
  if (!avatar) {
    throw new BadRequestException('Vui lòng chọn ảnh đại diện.')
  }

  if (!['image/jpeg', 'image/png'].includes(mimeType)) {
    throw new BadRequestException('Chỉ chấp nhận ảnh JPG hoặc PNG.')
  }

  if (size > 2 * 1024 * 1024) {
    throw new BadRequestException('Ảnh không được vượt quá 2MB.')
  }

  this.profile.avatar = avatar

  return this.getProfile()
}
}
