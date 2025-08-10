import { Injectable, Inject } from '@nestjs/common';
import type { FileService } from '../files/file-service.interface';
import { ModuleMetadata, ModuleValidationResult } from './module.types';

@Injectable()
export class ModuleValidator {
  constructor(@Inject('FileService') private fileService: FileService) {}

  /**
   * Validate a module's structure and metadata
   */
  async validateModuleStructure(
    username: string,
    modulePath: string,
  ): Promise<ModuleValidationResult> {
    const errors: string[] = [];
    let metadata: ModuleMetadata | null = null;

    try {
      // Check for required folders
      const requiredFolders = ['configuration', 'content'];
      
      for (const folder of requiredFolders) {
        try {
          await this.fileService.listFiles(username, `${modulePath}/${folder}`);
        } catch (error) {
          errors.push(`Missing required folder: ${folder}/`);
        }
      }

      // Check for module.json
      try {
        const moduleJsonContent = await this.fileService.readFile(
          username,
          `${modulePath}/configuration/module.json`
        );
        
        const moduleData = JSON.parse(moduleJsonContent);
        
        // Validate module.json structure
        if (!moduleData.module) {
          errors.push('module.json must have a "module" section');
        } else {
          const required = ['id', 'name', 'version', 'description', 'created', 'updated'];
          for (const field of required) {
            if (!moduleData.module[field]) {
              errors.push(`module.json is missing required field: module.${field}`);
            }
          }
          
          metadata = moduleData.module;
        }
      } catch (error) {
        if (error.message.includes('not found')) {
          errors.push('Missing required file: configuration/module.json');
        } else if (error.message.includes('JSON')) {
          errors.push('Invalid JSON in module.json');
        } else {
          errors.push(`Error reading module.json: ${error.message}`);
        }
      }

      // Check for content/README.md
      try {
        await this.fileService.readFile(username, `${modulePath}/content/README.md`);
      } catch (error) {
        errors.push('Missing required file: content/README.md');
      }

      // Check optional protected-files folder
      let hasProtectedFiles = false;
      try {
        await this.fileService.listFiles(username, `${modulePath}/protected-files`);
        hasProtectedFiles = true;
      } catch (error) {
        // Optional folder, not an error
      }

      return {
        isValid: errors.length === 0,
        errors,
        metadata,
        structure: {
          hasConfiguration: errors.every(e => !e.includes('configuration/')),
          hasContent: errors.every(e => !e.includes('content/')),
          hasProtectedFiles,
          hasModuleJson: errors.every(e => !e.includes('module.json')),
          hasReadme: errors.every(e => !e.includes('README.md')),
        },
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Module validation failed: ${error.message}`],
        metadata: null,
        structure: {
          hasConfiguration: false,
          hasContent: false,
          hasProtectedFiles: false,
          hasModuleJson: false,
          hasReadme: false,
        },
      };
    }
  }

  /**
   * Validate module.json schema
   */
  validateModuleJson(moduleData: any): string[] {
    const errors: string[] = [];

    if (!moduleData || typeof moduleData !== 'object') {
      errors.push('module.json must be a valid JSON object');
      return errors;
    }

    // Check module section
    if (!moduleData.module || typeof moduleData.module !== 'object') {
      errors.push('module.json must have a "module" section');
      return errors;
    }

    // Required fields in module section
    const requiredFields = [
      { field: 'id', type: 'string' },
      { field: 'name', type: 'string' },
      { field: 'version', type: 'string' },
      { field: 'description', type: 'string' },
      { field: 'created', type: 'string' },
      { field: 'updated', type: 'string' },
    ];

    for (const { field, type } of requiredFields) {
      if (!moduleData.module[field]) {
        errors.push(`Missing required field: module.${field}`);
      } else if (typeof moduleData.module[field] !== type) {
        errors.push(`Invalid type for module.${field}: expected ${type}`);
      }
    }

    // Validate version format (semantic versioning)
    if (moduleData.module.version && 
        !/^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/.test(moduleData.module.version)) {
      errors.push('Invalid version format. Use semantic versioning (e.g., 1.0.0)');
    }

    // Validate date formats
    for (const dateField of ['created', 'updated']) {
      if (moduleData.module[dateField]) {
        const date = new Date(moduleData.module[dateField]);
        if (isNaN(date.getTime())) {
          errors.push(`Invalid date format for module.${dateField}`);
        }
      }
    }

    // Validate optional structure section
    if (moduleData.structure && typeof moduleData.structure !== 'object') {
      errors.push('structure section must be an object');
    }

    // Validate optional features section
    if (moduleData.features) {
      if (!Array.isArray(moduleData.features)) {
        errors.push('features section must be an array');
      } else {
        for (let i = 0; i < moduleData.features.length; i++) {
          if (typeof moduleData.features[i] !== 'string') {
            errors.push(`features[${i}] must be a string`);
          }
        }
      }
    }

    return errors;
  }
}