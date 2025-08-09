import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import {
  FileService,
  FileInfo,
  UserProfile,
  ModuleInfo,
  ModuleTemplate,
} from './file-service.interface';

@Injectable()
export class R2FileService implements FileService {
  private readonly logger = new Logger(R2FileService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private configService: ConfigService) {
    const r2Config = this.configService.get('r2');

    if (
      !r2Config?.accountId ||
      !r2Config?.accessKeyId ||
      !r2Config?.secretAccessKey
    ) {
      this.logger.error('R2 configuration is missing. Service will not be functional.');
      this.logger.error('Please check environment variables: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
      throw new Error(
        'R2 configuration is missing. Please check environment variables.',
      );
    }

    this.bucket = r2Config.bucket;
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint:
        r2Config.endpoint ||
        `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
      },
    });

    this.logger.log(`R2FileService initialized with bucket: ${this.bucket}`);
  }

  async getUserProfile(username: string): Promise<UserProfile> {
    try {
      const content = await this.readFile(username, 'profile/user.json');
      return JSON.parse(content);
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new NotFoundException(`User profile not found: ${username}`);
      }
      throw error;
    }
  }

  async setUserProfile(username: string, profile: UserProfile): Promise<void> {
    const content = JSON.stringify(profile, null, 2);
    await this.writeFile(username, 'profile/user.json', content);
  }

  async userExists(username: string): Promise<boolean> {
    try {
      await this.getUserProfile(username);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return false;
      }
      throw error;
    }
  }

  async listUserProjects(username: string): Promise<string[]> {
    const files = await this.listFiles(username, 'projects/');
    return files.filter((file) => file.isDirectory).map((file) => file.name);
  }

  async createProject(
    username: string,
    projectName: string,
    moduleId: string,
  ): Promise<void> {
    // TODO: Implement project creation from module template
    // For now, create basic project structure
    const projectPath = `projects/${projectName}`;

    // Create README.md as placeholder
    const readmeContent = `# ${projectName}\n\nCreated from module: ${moduleId}\nCreated: ${new Date().toISOString()}\n`;
    await this.writeFile(username, `${projectPath}/README.md`, readmeContent);

    this.logger.log(`Created project: ${username}/${projectPath}`);
  }

  async deleteProject(username: string, projectName: string): Promise<void> {
    // TODO: Implement recursive project deletion
    // For now, just delete README.md
    await this.deleteFile(username, `projects/${projectName}/README.md`);
    this.logger.log(`Deleted project: ${username}/projects/${projectName}`);
  }

  async readFile(username: string, path: string): Promise<string> {
    this.validatePath(username, path);

    const key = `users/${username}/${path}`;
    const startTime = Date.now();

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const content = await response.Body!.transformToString();

      const duration = Date.now() - startTime;
      this.logger.log(`File read success: ${key} (${duration}ms)`);

      return content;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `File read failed: ${key} (${duration}ms)`,
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof Error && error.name === 'NoSuchKey') {
        throw new NotFoundException(`File not found: ${path}`);
      }
      throw error;
    }
  }

  async writeFile(
    username: string,
    path: string,
    content: string,
  ): Promise<void> {
    this.validatePath(username, path);

    const key = `users/${username}/${path}`;
    const startTime = Date.now();

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: content,
        ContentType: this.getContentType(path),
      });

      await this.s3Client.send(command);

      const duration = Date.now() - startTime;
      this.logger.log(
        `File write success: ${key} (${duration}ms, ${content.length} bytes)`,
      );
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `File write failed: ${key} (${duration}ms)`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async deleteFile(username: string, path: string): Promise<void> {
    this.validatePath(username, path);

    const key = `users/${username}/${path}`;
    const startTime = Date.now();

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);

      const duration = Date.now() - startTime;
      this.logger.log(`File delete success: ${key} (${duration}ms)`);
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `File delete failed: ${key} (${duration}ms)`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async listFiles(username: string, path: string = ''): Promise<FileInfo[]> {
    this.validatePath(username, path);

    const prefix = `users/${username}/${path}`;
    const startTime = Date.now();

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        Delimiter: '/',
      });

      const response = await this.s3Client.send(command);
      const files: FileInfo[] = [];

      // Add directories (CommonPrefixes)
      if (response.CommonPrefixes) {
        for (const prefix of response.CommonPrefixes) {
          const dirPath = prefix.Prefix!.replace(`users/${username}/`, '');
          const dirName = dirPath.replace(/\/$/, '').split('/').pop() || '';

          files.push({
            name: dirName,
            path: dirPath,
            size: 0,
            lastModified: new Date(),
            isDirectory: true,
          });
        }
      }

      // Add files (Contents)
      if (response.Contents) {
        for (const object of response.Contents) {
          const filePath = object.Key!.replace(`users/${username}/`, '');
          const fileName = filePath.split('/').pop() || '';

          // Skip the directory marker itself
          if (fileName) {
            files.push({
              name: fileName,
              path: filePath,
              size: object.Size || 0,
              lastModified: object.LastModified || new Date(),
              isDirectory: false,
            });
          }
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `File list success: ${prefix} (${duration}ms, ${files.length} items)`,
      );

      return files;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `File list failed: ${prefix} (${duration}ms)`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async listAvailableModules(): Promise<ModuleInfo[]> {
    // TODO: Implement module listing from modules/ prefix
    // For now, return empty array
    return [];
  }

  async getModuleTemplate(moduleId: string): Promise<ModuleTemplate> {
    // TODO: Implement module template loading
    throw new NotFoundException(`Module template not found: ${moduleId}`);
  }

  validatePath(username: string, path: string): boolean {
    if (!username || typeof username !== 'string') {
      throw new BadRequestException('Invalid username');
    }

    if (!path || typeof path !== 'string') {
      throw new BadRequestException('Invalid path');
    }

    // Sanitize path
    const sanitized = this.sanitizePath(path);
    if (sanitized !== path) {
      throw new BadRequestException(`Invalid path: contains unsafe characters`);
    }

    // Prevent path traversal
    if (path.includes('../') || path.startsWith('/') || path.includes('..\\')) {
      throw new BadRequestException(
        `Invalid path: cannot access parent directories`,
      );
    }

    // Prevent access to sensitive files
    const forbiddenPaths = ['.env', '.git', 'node_modules'];
    if (forbiddenPaths.some((forbidden) => path.includes(forbidden))) {
      throw new BadRequestException(
        `Invalid path: access to ${path} is forbidden`,
      );
    }

    return true;
  }

  sanitizePath(path: string): string {
    return path
      .replace(/\\/g, '/') // Convert backslashes to forward slashes
      .replace(/\/+/g, '/') // Replace multiple slashes with single slash
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(/\/+$/, ''); // Remove trailing slashes (except for directory listings)
  }

  private getContentType(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      md: 'text/markdown',
      txt: 'text/plain',
      json: 'application/json',
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      ts: 'application/typescript',
      xml: 'application/xml',
      yaml: 'application/x-yaml',
      yml: 'application/x-yaml',
    };

    return mimeTypes[extension || ''] || 'text/plain';
  }
}
