import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import nodemailer from 'nodemailer'

export async function sendActivationEmail(
  email: string,
  username: string,
  temporaryPassword: string,
): Promise<void> {
  const mode = process.env.MAIL_MODE ?? 'preview'
  const from = process.env.MAIL_FROM ?? 'TMS <noreply@localhost>'
  const message = {
    from,
    to: email,
    subject: 'Kích hoạt tài khoản - Hệ thống TMS',
    text: [
      `Xin chào ${username},`,
      '',
      'Tài khoản học viên của bạn đã được tạo thành công.',
      `Tên đăng nhập: ${username}`,
      `Mật khẩu tạm thời: ${temporaryPassword}`,
      '',
      'Vui lòng đăng nhập và đổi mật khẩu sau lần đăng nhập đầu tiên.',
      '',
      'Trân trọng,',
      'Hệ thống TMS',
    ].join('\n'),
  }

  if (mode === 'preview') {
    const previewDirectory = resolve(process.env.MAIL_PREVIEW_DIR ?? './data/mail-preview')
    await mkdir(previewDirectory, { recursive: true })
    const preview = await nodemailer.createTransport({ streamTransport: true, buffer: true })
      .sendMail(message)
    const content = preview.message
    if (!Buffer.isBuffer(content)) {
      throw new Error('Email preview transport did not return an email message.')
    }
    await writeFile(join(previewDirectory, `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}.eml`), content, {
      flag: 'wx',
      mode: 0o600,
    })
    return
  }

  if (mode !== 'smtp') {
    throw new Error('MAIL_MODE must be either preview or smtp.')
  }

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const secure = process.env.SMTP_SECURE === 'true'
  if (!host) throw new Error('SMTP_HOST is required when MAIL_MODE=smtp.')
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid port number.')
  }
  if (user && !password) throw new Error('SMTP_PASSWORD is required when SMTP_USER is set.')

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass: password } : undefined,
  })

  await transporter.sendMail(message)
}
