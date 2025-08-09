import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set global API prefix
  const apiPrefix = configService.get('apiPrefix');
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS
  app.enableCors({
    origin: configService.get('cors.origins'),
    credentials: true,
  });

  const port = configService.get('port');
  await app.listen(port);
  console.log(
    `🚀 Production service running on http://localhost:${port}/${apiPrefix}`,
  );
}
bootstrap();
