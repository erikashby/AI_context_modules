import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { FileService } from '../files/file-service.interface';
import { ModuleValidator } from './module.validator';
import { ModuleMetadata, ModuleValidationResult } from './module.types';

@Injectable()
export class ModuleService {
  constructor(
    @Inject('FileService') private fileService: FileService,
    private moduleValidator: ModuleValidator,
  ) {}

  /**
   * List all available modules from R2 storage
   */
  async listModules(): Promise<ModuleMetadata[]> {
    try {
      // List all module directories from R2
      const moduleFolders = await this.fileService.listFiles('system', 'modules');
      
      const modules: ModuleMetadata[] = [];
      
      for (const folder of moduleFolders) {
        if (!folder.isDirectory) continue;
        
        try {
          // Read module.json from each module
          const moduleJsonPath = `modules/${folder.name}/configuration/module.json`;
          const moduleJsonContent = await this.fileService.readFile('system', moduleJsonPath);
          const moduleData = JSON.parse(moduleJsonContent);
          
          // Validate module structure
          const validation = await this.moduleValidator.validateModuleStructure(
            'system',
            `modules/${folder.name}`
          );
          
          if (validation.isValid) {
            modules.push({
              ...moduleData.module,
              path: `modules/${folder.name}`,
              source: 'r2',
              features: moduleData.features,
            });
          }
        } catch (error) {
          console.error(`Failed to load module ${folder.name}:`, error);
          // Skip invalid modules
        }
      }
      
      return modules;
    } catch (error) {
      console.error('Failed to list modules:', error);
      return [];
    }
  }

  /**
   * Create a new project from a module template or GitHub URL
   */
  async createProject(
    username: string,
    projectName: string,
    template: string,
  ): Promise<{ success: boolean; message: string; projectPath: string }> {
    // Validate project name
    if (!this.isValidProjectName(projectName)) {
      throw new BadRequestException(
        'Invalid project name. Use only letters, numbers, hyphens, and underscores.'
      );
    }

    // Check if project already exists
    const projectPath = `projects/${projectName}`;
    try {
      await this.fileService.listFiles(username, projectPath);
      throw new BadRequestException(`Project "${projectName}" already exists`);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
      // Project doesn't exist, continue
    }

    // Determine if template is a URL or module ID
    const isUrl = template.startsWith('http://') || template.startsWith('https://');
    
    if (isUrl) {
      return await this.createProjectFromGitHub(username, projectName, template);
    } else {
      return await this.createProjectFromModule(username, projectName, template);
    }
  }

  /**
   * Create project from a published module
   */
  private async createProjectFromModule(
    username: string,
    projectName: string,
    moduleId: string,
  ): Promise<{ success: boolean; message: string; projectPath: string }> {
    const modulePath = `modules/${moduleId}`;
    
    // Validate module exists and is valid
    const validation = await this.moduleValidator.validateModuleStructure('system', modulePath);
    if (!validation.isValid) {
      throw new BadRequestException(
        `Invalid module "${moduleId}": ${validation.errors.join(', ')}`
      );
    }

    // Copy module structure to user's project
    const projectPath = `projects/${projectName}`;
    
    try {
      // Copy configuration tier (hidden from user)
      await this.copyDirectory(
        'system',
        `${modulePath}/configuration`,
        username,
        `${projectPath}/configuration`
      );

      // Copy protected-files tier if it exists (invisible to user/AI)
      try {
        await this.fileService.listFiles('system', `${modulePath}/protected-files`);
        await this.copyDirectory(
          'system',
          `${modulePath}/protected-files`,
          username,
          `${projectPath}/protected-files`
        );
      } catch (error) {
        // protected-files is optional, ignore if not found
      }

      // Copy content tier (user's workspace)
      await this.copyDirectory(
        'system',
        `${modulePath}/content`,
        username,
        `${projectPath}/content`
      );

      // Create project metadata
      const projectMetadata = {
        createdAt: new Date().toISOString(),
        createdFrom: moduleId,
        source: 'module',
        version: validation.metadata?.version || '1.0.0',
      };

      await this.fileService.writeFile(
        username,
        `${projectPath}/configuration/project.json`,
        JSON.stringify(projectMetadata, null, 2)
      );

      return {
        success: true,
        message: `Project "${projectName}" created successfully from module "${moduleId}"`,
        projectPath: projectPath,
      };
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Create project from a GitHub repository
   */
  private async createProjectFromGitHub(
    username: string,
    projectName: string,
    githubUrl: string,
  ): Promise<{ success: boolean; message: string; projectPath: string }> {
    // Parse GitHub URL
    const repoInfo = this.parseGitHubUrl(githubUrl);
    if (!repoInfo) {
      throw new BadRequestException('Invalid GitHub URL format');
    }

    // For now, we'll implement a simplified version
    // In production, this would clone the repo and validate it
    throw new BadRequestException(
      'GitHub module import is coming soon. Please use published modules for now.'
    );
  }

  /**
   * Copy directory recursively
   */
  private async copyDirectory(
    sourceUser: string,
    sourcePath: string,
    destUser: string,
    destPath: string,
  ): Promise<void> {
    // List all files in source directory
    const files = await this.fileService.listFiles(sourceUser, sourcePath);

    for (const file of files) {
      const sourceFilePath = `${sourcePath}/${file.name}`;
      const destFilePath = `${destPath}/${file.name}`;

      if (file.isDirectory) {
        // Recursively copy subdirectory
        await this.copyDirectory(sourceUser, sourceFilePath, destUser, destFilePath);
      } else {
        // Copy file
        const content = await this.fileService.readFile(sourceUser, sourceFilePath);
        await this.fileService.writeFile(destUser, destFilePath, content);
      }
    }
  }

  /**
   * Validate project name
   */
  private isValidProjectName(name: string): boolean {
    const validNameRegex = /^[a-zA-Z0-9_-]+$/;
    return validNameRegex.test(name) && name.length > 0 && name.length <= 100;
  }

  /**
   * Parse GitHub URL to extract owner and repo
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const githubRegex = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/;
    const match = url.match(githubRegex);
    
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
    
    return null;
  }
}