import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { McpAuthService } from './mcp-auth.service';
import { FilesModule } from '../files/files.module';
import { ModulesModule } from '../modules/modules.module';

@Module({
  imports: [FilesModule, ModulesModule],
  controllers: [McpController],
  providers: [McpService, McpAuthService],
  exports: [McpService, McpAuthService],
})
export class McpModule {}
