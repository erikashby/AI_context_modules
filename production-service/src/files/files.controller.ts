import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import type { FileService } from './file-service.interface';

@Controller('files')
export class FilesController {
  constructor(@Inject('FileService') private fileService: FileService) {}

  @Get('test')
  async testConnection() {
    try {
      // Test basic R2 connectivity by listing files for a test user
      const files = await this.fileService.listFiles('test-user', '');
      return {
        success: true,
        message: 'R2 connection successful',
        fileCount: files.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: 'R2 connection failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('test-write')
  async testWrite(@Body() body: { username: string; content: string }) {
    const { username, content } = body;
    const testPath = `test-${Date.now()}.txt`;

    try {
      // Write test file
      await this.fileService.writeFile(username, testPath, content);

      // Read it back
      const readContent = await this.fileService.readFile(username, testPath);

      // Clean up
      await this.fileService.deleteFile(username, testPath);

      return {
        success: true,
        message: 'Write/Read/Delete test successful',
        written: content,
        read: readContent,
        match: content === readContent,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: 'Write/Read/Delete test failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('user/:username/files')
  async listUserFiles(@Param('username') username: string) {
    try {
      const files = await this.fileService.listFiles(username, '');
      return {
        success: true,
        username,
        files,
        count: files.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: 'Failed to list user files',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
