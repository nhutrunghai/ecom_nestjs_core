import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('app.port');
  const nodeEnv = configService.getOrThrow<string>('app.nodeEnv');
  if (nodeEnv === 'development') {
    app.use(morgan('dev'));
  }
  await app.listen(port);
}
bootstrap();
