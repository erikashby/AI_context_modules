import { Controller, Get, Inject } from '@nestjs/common';
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

  // NOTE: All file operations are now internal service methods only.
  // File access should go through:
  // - MCP protocol endpoints (authenticated): /api/v1/mcp/:username/:key
  // - Future authenticated web UI endpoints
  // - Internal service-to-service calls
  //
  // Public file endpoints removed for security:
  // - Prevented unauthorized access to user files
  // - Eliminated DOS attack vector from test-write endpoint
  // - Enforces proper authentication flow
}
