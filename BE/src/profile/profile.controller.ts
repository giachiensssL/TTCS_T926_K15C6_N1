import { Body, Controller, Get, Put, Patch } from '@nestjs/common'
import { UpdateAvatarDto, UpdateProfileDto } from './profile.dto'
import { Profile, ProfileService } from './profile.service'

@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(): Profile {
    return this.profileService.getProfile()
  }

  @Put()
  updateProfile(@Body() update: UpdateProfileDto): Profile {
    return this.profileService.updateProfile(update)
  }
  @Patch('avatar')
updateAvatar(@Body() data: UpdateAvatarDto): Profile {
  return this.profileService.updateAvatar(
    data.avatar,
    data.mimeType,
    data.size,
  )
}
}
