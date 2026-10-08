import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((origin) => origin.trim()),
  })
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )

  const port = Number(process.env.PORT ?? 3000)
  await app.listen(port, '0.0.0.0')
  console.log(`TMS profile API is listening on http://localhost:${port}`)
}

void bootstrap()
