import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { McpAuthService } from './mcp-auth.service';
import type { FileService } from '../files/file-service.interface';

@Injectable()
export class McpService {
  constructor(
    private mcpAuthService: McpAuthService,
    @Inject('FileService') private fileService: FileService,
  ) {}
  async handleRequest(
    req: Request,
    res: Response,
    username: string,
    key: string,
  ) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(
      `[${requestId}] MCP request for ${username} - Method: ${req.method}`,
    );

    try {
      // 1. Real file-based API key validation
      if (!(await this.mcpAuthService.validateApiKey(username, key))) {
        console.log(`[${requestId}] Authentication failed for ${username}`);
        return res.status(401).json({
          error: 'Invalid authentication credentials',
          message: 'Check your MCP endpoint URL and key',
        });
      }

      console.log(`[${requestId}] Authenticated MCP request for ${username}`);

      // 2. Create stateless MCP server with test tool
      const server = new Server(
        {
          name: 'AI Context Service - NestJS Test',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        },
      );

      // 3. Register tools
      server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
          tools: [
            {
              name: 'ping',
              description: 'Test connectivity with the MCP server',
              inputSchema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    description: 'Optional message to include in response',
                  },
                },
              },
            },
            {
              name: 'read_file',
              description: 'Read content from any file in project workspace',
              inputSchema: {
                type: 'object',
                properties: {
                  project: {
                    type: 'string',
                    description: 'Project name',
                  },
                  path: {
                    type: 'string',
                    description: 'File path within project',
                  },
                },
                required: ['project', 'path'],
              },
            },
            {
              name: 'write_file',
              description:
                'Create or update files with automatic directory creation',
              inputSchema: {
                type: 'object',
                properties: {
                  project: {
                    type: 'string',
                    description: 'Project name',
                  },
                  path: {
                    type: 'string',
                    description: 'File path within project',
                  },
                  content: {
                    type: 'string',
                    description: 'File content to write',
                  },
                },
                required: ['project', 'path', 'content'],
              },
            },
            {
              name: 'delete_file',
              description: 'Remove files with safety checks',
              inputSchema: {
                type: 'object',
                properties: {
                  project: {
                    type: 'string',
                    description: 'Project name',
                  },
                  path: {
                    type: 'string',
                    description: 'File path within project',
                  },
                },
                required: ['project', 'path'],
              },
            },
            {
              name: 'list_folder_contents',
              description:
                'List files and directories with metadata within project',
              inputSchema: {
                type: 'object',
                properties: {
                  project: {
                    type: 'string',
                    description: 'Project name',
                  },
                  path: {
                    type: 'string',
                    description:
                      'Folder path within project (empty string for root)',
                    default: '',
                  },
                },
                required: ['project'],
              },
            },
            {
              name: 'read_multiple_files',
              description: 'Batch file reading with error handling per file',
              inputSchema: {
                type: 'object',
                properties: {
                  project: {
                    type: 'string',
                    description: 'Project name',
                  },
                  paths: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of file paths within project',
                  },
                },
                required: ['project', 'paths'],
              },
            },
            {
              name: 'create_folder',
              description: 'Create persistent empty directories within project',
              inputSchema: {
                type: 'object',
                properties: {
                  project: {
                    type: 'string',
                    description: 'Project name',
                  },
                  path: {
                    type: 'string',
                    description: 'Folder path within project',
                  },
                },
                required: ['project', 'path'],
              },
            },
            {
              name: 'delete_folder',
              description:
                'Remove directories with safety options within project',
              inputSchema: {
                type: 'object',
                properties: {
                  project: {
                    type: 'string',
                    description: 'Project name',
                  },
                  path: {
                    type: 'string',
                    description: 'Folder path within project',
                  },
                  recursive: {
                    type: 'boolean',
                    description:
                      'Delete folder and all contents (default: false)',
                    default: false,
                  },
                },
                required: ['project', 'path'],
              },
            },
            {
              name: 'get_user_profile',
              description: 'Access user profile and preferences',
              inputSchema: {
                type: 'object',
                properties: {},
              },
            },
            {
              name: 'list_projects',
              description: 'List user projects with guidance for new users',
              inputSchema: {
                type: 'object',
                properties: {},
              },
            },
          ],
        };
      });

      // 4. Register tool handler
      server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        if (name === 'ping') {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    message: 'pong',
                    echo: args?.message || 'No message provided',
                    timestamp: new Date().toISOString(),
                    username: username,
                    environment: 'production-nestjs',
                    server: 'AI Context Service',
                    version: '1.0.0',
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        if (name === 'read_file') {
          return await this.handleReadFile(args, username);
        }

        if (name === 'write_file') {
          return await this.handleWriteFile(args, username);
        }

        if (name === 'delete_file') {
          return await this.handleDeleteFile(args, username);
        }

        if (name === 'list_folder_contents') {
          return await this.handleListFolderContents(args, username);
        }

        if (name === 'read_multiple_files') {
          return await this.handleReadMultipleFiles(args, username);
        }

        if (name === 'create_folder') {
          return await this.handleCreateFolder(args, username);
        }

        if (name === 'delete_folder') {
          return await this.handleDeleteFolder(args, username);
        }

        if (name === 'get_user_profile') {
          return await this.handleGetUserProfile(args, username);
        }

        if (name === 'list_projects') {
          return await this.handleListProjects(args, username);
        }

        throw new Error(`Unknown tool: ${name}`);
      });

      // 5. Handle with StreamableHTTPServerTransport (stateless)
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode
      });

      // 6. Proper cleanup on request close
      res.on('close', () => {
        console.log(`[${requestId}] Request closed, cleaning up`);
        try {
          transport.close();
          server.close();
        } catch (cleanupError) {
          console.error(`[${requestId}] Cleanup error:`, cleanupError);
        }
      });

      // 7. Connect and handle request
      await server.connect(transport);

      if (req.method === 'POST') {
        await transport.handleRequest(req, res, req.body);
      } else {
        await transport.handleRequest(req, res);
      }

      console.log(`[${requestId}] MCP request completed successfully`);
    } catch (error) {
      console.error(`[${requestId}] MCP error:`, error);

      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
            details: error.message,
          },
          id: req.body?.id || null,
        });
      }
    }
  }

  // Wave 1 MCP Tool Implementations - Basic File Access

  private async handleReadFile(args: any, username: string) {
    const { project, path } = args;

    if (!project || !path) {
      throw new BadRequestException('project and path parameters are required');
    }

    try {
      // Map clean project-scoped path to internal three-tier structure
      const internalPath = `projects/${project}/content/${path}`;
      const content = await this.fileService.readFile(username, internalPath);

      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          content: [
            {
              type: 'text',
              text: `File not found: ${path} in project ${project}`,
            },
          ],
          isError: true,
        };
      }
      throw error;
    }
  }

  private async handleWriteFile(args: any, username: string) {
    const { project, path, content } = args;

    if (!project || !path || content === undefined) {
      throw new BadRequestException(
        'project, path, and content parameters are required',
      );
    }

    try {
      // Map to internal three-tier structure
      const internalPath = `projects/${project}/content/${path}`;

      // Extract directory path for auto-creation
      const lastSlashIndex = internalPath.lastIndexOf('/');
      const directoryPath = internalPath.substring(0, lastSlashIndex);

      // Create parent directories if they don't exist
      if (directoryPath && directoryPath !== internalPath) {
        try {
          await this.fileService.listFiles(username, directoryPath);
        } catch (error) {
          if (error instanceof NotFoundException) {
            // Directory doesn't exist, create it
            await this.fileService.createFolder(username, directoryPath);
          }
        }
      }

      // Write the file to content/ folder
      await this.fileService.writeFile(username, internalPath, content);

      return {
        content: [
          {
            type: 'text',
            text: `File written successfully: ${path}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to write file ${path} in project ${project}: ${error.message}`,
      );
    }
  }

  private async handleDeleteFile(args: any, username: string) {
    const { project, path } = args;

    if (!project || !path) {
      throw new BadRequestException('project and path parameters are required');
    }

    try {
      // Map to internal three-tier structure
      const internalPath = `projects/${project}/content/${path}`;
      await this.fileService.deleteFile(username, internalPath);

      return {
        content: [
          {
            type: 'text',
            text: `File deleted successfully: ${path}`,
          },
        ],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          content: [
            {
              type: 'text',
              text: `File not found: ${path} in project ${project}`,
            },
          ],
        };
      }
      throw error;
    }
  }

  private async handleListFolderContents(args: any, username: string) {
    const { project, path = '' } = args;

    if (!project) {
      throw new BadRequestException('project parameter is required');
    }

    try {
      // Map to internal three-tier structure
      const internalPath = `projects/${project}/content/${path}`;
      const files = await this.fileService.listFiles(username, internalPath);

      // Format output for Claude
      const formattedList = files
        .map((file) => {
          const type = file.isDirectory ? 'DIR' : 'FILE';
          const size = file.isDirectory ? '' : ` (${file.size} bytes)`;
          const modified = file.lastModified.toISOString().split('T')[0];

          return `${type.padEnd(4)} ${file.name}${size} - Modified: ${modified}`;
        })
        .join('\n');

      const displayPath = path || 'root';
      const summary =
        `Contents of ${project}/${displayPath}:\n` +
        `${files.length} items (${files.filter((f) => f.isDirectory).length} folders, ${files.filter((f) => !f.isDirectory).length} files)\n\n` +
        formattedList;

      return {
        content: [
          {
            type: 'text',
            text: summary,
          },
        ],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          content: [
            {
              type: 'text',
              text: `Directory not found: ${path} in project ${project}`,
            },
          ],
        };
      }
      throw error;
    }
  }

  private async handleReadMultipleFiles(args: any, username: string) {
    const { project, paths } = args;

    if (!project || !Array.isArray(paths)) {
      throw new BadRequestException(
        'project parameter and paths array are required',
      );
    }

    if (paths.length === 0) {
      throw new BadRequestException('paths array must not be empty');
    }

    const results = await Promise.allSettled(
      paths.map(async (path: string) => {
        try {
          const internalPath = `projects/${project}/content/${path}`;
          const content = await this.fileService.readFile(
            username,
            internalPath,
          );
          return { path, success: true, content };
        } catch (error) {
          return {
            path,
            success: false,
            error:
              error instanceof NotFoundException
                ? 'File not found'
                : error.message,
          };
        }
      }),
    );

    const output = results
      .map((result) => {
        const data =
          result.status === 'fulfilled' ? result.value : result.reason;

        if (data.success) {
          return `=== ${data.path} ===\n${data.content}\n`;
        } else {
          return `=== ${data.path} ===\nERROR: ${data.error}\n`;
        }
      })
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
  }

  private async handleCreateFolder(args: any, username: string) {
    const { project, path } = args;

    if (!project || !path) {
      throw new BadRequestException('project and path parameters are required');
    }

    try {
      // Map to internal three-tier structure
      const internalPath = `projects/${project}/content/${path}`;
      await this.fileService.createFolder(username, internalPath);

      return {
        content: [
          {
            type: 'text',
            text: `Folder created successfully: ${path}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to create folder ${path} in project ${project}: ${error.message}`,
      );
    }
  }

  private async handleDeleteFolder(args: any, username: string) {
    const { project, path, recursive = false } = args;

    if (!project || !path) {
      throw new BadRequestException('project and path parameters are required');
    }

    try {
      // Map to internal three-tier structure
      const internalPath = `projects/${project}/content/${path}`;
      await this.fileService.removeFolder(username, internalPath, recursive);

      return {
        content: [
          {
            type: 'text',
            text: `Folder deleted successfully: ${path}`,
          },
        ],
      };
    } catch (error) {
      if (error.message.includes('not empty')) {
        return {
          content: [
            {
              type: 'text',
              text: `Folder not empty: ${path}. Use recursive=true to delete all contents.`,
            },
          ],
        };
      }
      throw error;
    }
  }

  private async handleGetUserProfile(args: any, username: string) {
    try {
      // This accesses user profile outside of project structure
      const profile = await this.fileService.getUserProfile(username);

      // Format profile for Claude (exclude sensitive data)
      const displayProfile = {
        username: profile.username,
        email: profile.email,
        createdAt: profile.createdAt,
        lastActive: profile.lastActive,
        settings: profile.settings,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(displayProfile, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          content: [
            {
              type: 'text',
              text: 'User profile not found. Profile may need to be created.',
            },
          ],
        };
      }
      throw error;
    }
  }

  private async handleListProjects(args: any, username: string) {
    try {
      const projects = await this.fileService.listFiles(username, 'projects');

      if (projects.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No projects found. To get started:\n\n' +
                    '1. Create a new project: create_project("my-first-project")\n' +
                    '2. Add files: write_file("my-first-project", "context/goals.md", "# My Goals")\n' +
                    '3. Explore structure: explore_project("my-first-project")',
            },
          ],
        };
      }

      const projectList = projects
        .filter((p) => p.isDirectory)
        .map((p) => `• ${p.name} (modified: ${p.lastModified.toISOString().split('T')[0]})`)
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `Your Projects (${projects.length}):\n\n${projectList}\n\nUse explore_project("project-name") to see project contents.`,
          },
        ],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Projects directory doesn't exist - brand new user
        return {
          content: [
            {
              type: 'text',
              text: 'Welcome! You don\'t have any projects yet.\n\n' +
                    'To create your first project:\n' +
                    'create_project("my-first-project")\n' +
                    'write_file("my-first-project", "README.md", "# My First Project")',
            },
          ],
        };
      }
      throw error;
    }
  }
}
