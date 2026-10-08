import { Transform } from 'class-transformer'
import {
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  IsInt,
  Max,
} from 'class-validator'

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value
const trimOptionalDate = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : trimString({ value })

export class UpdateProfileDto {
  @Transform(trimString)
  @IsString()
  @Matches(/\S/, { message: 'Họ tên là bắt buộc.' })
  @MaxLength(100, { message: 'Họ tên không được quá 100 ký tự.' })
  fullName!: string

  @Transform(trimString)
  @IsString()
  @Matches(/^0(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])\d{7}$/, {
    message: 'Số điện thoại phải là số di động Việt Nam gồm 10 chữ số, bắt đầu bằng 0.',
  })
  phone!: string

  @Transform(trimOptionalDate)
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Ngày sinh không đúng định dạng.' })
  dateOfBirth?: string

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Địa chỉ không được quá 255 ký tự.' })
  address?: string
}
export class UpdateAvatarDto {
  @IsString()
  avatar!: string

  @IsString()
  @Matches(/^(image\/jpeg|image\/png)$/, {
    message: 'Chỉ chấp nhận ảnh JPG hoặc PNG.',
  })
  mimeType!: string

  @IsInt()
  @Max(2 * 1024 * 1024, {
    message: 'Ảnh không được vượt quá 2MB.',
  })
  size!: number
}
