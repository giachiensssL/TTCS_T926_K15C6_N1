import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UsersMailerService {
  async sendActivationEmail(
    to: string,
    fullName: string,
    temporaryPassword: string,
  ): Promise<void> {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM;

    if (!host || !user || !password || !from) {
      throw new ServiceUnavailableException(
        'Chưa cấu hình dịch vụ gửi email. Vui lòng liên hệ quản trị hệ thống.',
      );
    }

    const port = Number(process.env.SMTP_PORT ?? 587);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new ServiceUnavailableException(
        'Cấu hình cổng SMTP không hợp lệ.',
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });
    const activationUrl = process.env.FRONTEND_URL;
    const activationLine = activationUrl
      ? `<p>Kích hoạt và đăng nhập tại: <a href="${activationUrl}">${activationUrl}</a></p>`
      : '';

    await transporter.sendMail({
      from,
      to,
      subject: 'Kích hoạt tài khoản TMS',
      text:
        `Xin chào ${fullName},\n\n` +
        `Tài khoản TMS của bạn đã được tạo. Mật khẩu tạm thời: ${temporaryPassword}\n` +
        'Vui lòng đăng nhập và đổi mật khẩu ngay lần đầu sử dụng.',
      html:
        `<p>Xin chào ${this.escapeHtml(fullName)},</p>` +
        '<p>Tài khoản TMS của bạn đã được tạo.</p>' +
        `<p>Mật khẩu tạm thời: <strong>${this.escapeHtml(temporaryPassword)}</strong></p>` +
        activationLine +
        '<p>Vui lòng đăng nhập và đổi mật khẩu ngay lần đầu sử dụng.</p>',
    });
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return entities[character];
    });
  }
}
