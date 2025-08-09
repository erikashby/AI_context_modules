import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { R2FileService } from './r2-file.service';
import { FilesController } from './files.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [
    {
      provide: 'FileService',
      useClass: R2FileService,
    },
  ],
  exports: ['FileService'],
})
export class FilesModule {}