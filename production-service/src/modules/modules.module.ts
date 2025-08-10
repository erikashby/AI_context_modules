import { Module } from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleValidator } from './module.validator';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  providers: [ModuleService, ModuleValidator],
  exports: [ModuleService],
})
export class ModulesModule {}