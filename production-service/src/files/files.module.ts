import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { R2FileService } from './r2-file.service';
import { FilesController } from './files.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [
    {
      provide: 'FileService',
      useFactory: (configService: ConfigService) => {
        try {
          return new R2FileService(configService);
        } catch (error) {
          console.error('Failed to initialize R2FileService:', error.message);
          // Return a mock service that throws helpful errors
          return {
            async testConnection() {
              throw new Error('R2 service not configured. Please check environment variables.');
            },
            async listFiles() { 
              throw new Error('R2 service not configured. Please check environment variables.'); 
            },
            async writeFile() { 
              throw new Error('R2 service not configured. Please check environment variables.'); 
            },
            async readFile() { 
              throw new Error('R2 service not configured. Please check environment variables.'); 
            },
            async deleteFile() { 
              throw new Error('R2 service not configured. Please check environment variables.'); 
            }
          };
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['FileService'],
})
export class FilesModule {}
