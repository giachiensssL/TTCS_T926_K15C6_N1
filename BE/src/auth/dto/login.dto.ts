import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  email: string;

  @IsString()
  @Length(8, 128, { message: 'Mật khẩu phải có từ 8 đến 128 ký tự.' })
  password: string;
}
