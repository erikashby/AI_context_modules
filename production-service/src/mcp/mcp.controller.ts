import { All, Controller, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpService } from './mcp.service';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @All(':username/:key')
  async handleMcp(
    @Param('username') username: string,
    @Param('key') key: string,
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response,
  ) {
    await this.mcpService.handleRequest(req, res, username, key);
  }
}