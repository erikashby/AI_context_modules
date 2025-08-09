import { Controller, Get, Inject } from '@nestjs/common';
import type { FileService } from './file-service.interface';

@Controller('files')
export class FilesController {
  constructor(@Inject('FileService') private fileService: FileService) {}


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
