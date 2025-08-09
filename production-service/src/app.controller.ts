import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('debug/config')
  getConfigDebug() {
    const r2Config = this.configService.get('r2');
    return {
      r2ConfigExists: !!r2Config,
      hasAccountId: !!r2Config?.accountId,
      hasAccessKeyId: !!r2Config?.accessKeyId,
      hasSecretAccessKey: !!r2Config?.secretAccessKey,
      bucket: r2Config?.bucket || 'not set',
      timestamp: new Date().toISOString(),
    };
  }
}
