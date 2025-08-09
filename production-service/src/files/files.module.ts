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
          // Return a mock service that implements the FileService interface
          const mockError = new Error('R2 service not configured. Please check environment variables.');
          return {
            async getUserProfile() { throw mockError; },
            async setUserProfile() { throw mockError; },
            async userExists() { throw mockError; },
            async listUserProjects() { throw mockError; },
            async createProject() { throw mockError; },
            async deleteProject() { throw mockError; },
            async readFile() { throw mockError; },
            async writeFile() { throw mockError; },
            async deleteFile() { throw mockError; },
            async listFiles() { throw mockError; },
            async createFolder() { throw mockError; },
            async removeFolder() { throw mockError; },
            async listAvailableModules() { throw mockError; },
            async getModuleTemplate() { throw mockError; },
            validatePath() { throw mockError; },
            sanitizePath() { throw mockError; },
          };
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['FileService'],
})
export class FilesModule {}
