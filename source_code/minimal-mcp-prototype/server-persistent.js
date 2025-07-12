// Persistent Context Navigation MCP Server with Write/Delete Capabilities
// File System Persistence - Context data survives server restarts
// Based on proven stateless architecture from server-context.js

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');

const PORT = process.env.PORT || 3000;

// File system paths
const CONTEXT_DATA_DIR = path.join(__dirname, 'context-data');
const PERSONAL_ORG_DIR = path.join(CONTEXT_DATA_DIR, 'personal-organization');

// Utility functions for file operations
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function validateProjectId(projectId) {
  if (projectId === 'personal-health') {
    throw new Error('Project "personal-health" is not implemented yet. Currently only "personal-organization" is available.');
  }
  if (projectId !== 'personal-organization') {
    throw new Error(`Unknown project: ${projectId}`);
  }
}

async function getFilePath(projectId, filePath) {
  await validateProjectId(projectId);
  
  // Sanitize file path to prevent directory traversal
  const sanitizedPath = filePath.replace(/^\/+|\/+$/g, '').replace(/\.\./g, '');
  const fullPath = path.join(PERSONAL_ORG_DIR, sanitizedPath);
  
  // Ensure the path is within our project directory
  if (!fullPath.startsWith(PERSONAL_ORG_DIR)) {
    throw new Error('Invalid file path: Path must be within project directory');
  }
  
  return fullPath;
}

async function initializeFileSystem() {
  console.log('Initializing file system...');
  
  // Ensure base directories exist
  await ensureDirectoryExists(CONTEXT_DATA_DIR);
  await ensureDirectoryExists(PERSONAL_ORG_DIR);
  
  // Check if data already exists
  try {
    await fs.access(path.join(PERSONAL_ORG_DIR, 'README.md'));
    console.log('File system already initialized with existing data');
    return;
  } catch {
    console.log('Creating initial file structure...');
  }
  
  // Create directory structure
  const directories = [
    'current-status',
    'planning/2025/2025-07-06',
    'projects/active/johnson-presentation',
    'projects/active/q3-budget-planning',
    'projects/planning/team-expansion',
    'projects/completed/website-redesign',
    'goals-and-vision'
  ];
  
  for (const dir of directories) {
    await ensureDirectoryExists(path.join(PERSONAL_ORG_DIR, dir));
  }
  
  // Create initial files with sample content
  const initialFiles = {
    'README.md': `# Personal Organization

This project contains daily planning, projects, and life management context.

## Folder Structure
- current-status/ - Current priorities and this week's focus
- planning/ - Daily and weekly planning notes
- projects/ - Active, planning, and completed projects
- goals-and-vision/ - Long-term goals and vision`,

    'current-status/README.md': `# Current Status

This folder contains your immediate priorities and current focus areas.`,

    'current-status/priorities.md': `# Current Priorities (Updated: 2025-07-12)

## Work Projects
1. **Johnson Presentation** (Due: Thursday 7/17)
   - Status: 70% complete
   - Need: 2 hours focused time
   - Risk: Medium - timing tight

2. **Budget Planning Q3** (Due: Friday 7/18)
   - Status: Research phase
   - Need: Department input by Wednesday
   - Risk: Low - on track

3. **Team Onboarding** (Ongoing)
   - Status: New hire starts Monday
   - Need: Laptop setup, training schedule
   - Risk: Low - prepared

## Personal Commitments
- Soccer pickup Friday 6pm (committed)
- Dentist appointment Tuesday 2pm
- Family dinner Sunday 5pm

## Health Goals
- Gym 3x this week (current: 2/3)
- 8hrs sleep target (averaging 7.2hrs)
- Meal prep Sunday`,

    'current-status/this-week.md': `# This Week Focus (Week of July 12, 2025)

## Weekly Theme
**"Execution Week"** - Finish Johnson presentation and prepare for Q3 planning

## Key Objectives
1. Complete Johnson presentation by Wednesday
2. Gather budget input from all departments
3. Onboard new team member successfully
4. Maintain health routines

## Schedule Highlights
- **Monday**: Team standup 9am, Focus block 10-12pm
- **Tuesday**: Dentist 2pm, Budget planning 3-5pm
- **Wednesday**: Johnson presentation review 10am
- **Thursday**: Johnson presentation delivery 2pm
- **Friday**: New hire onboarding, Soccer 6pm

## Weekly Success Metrics
- [ ] Johnson presentation delivered successfully
- [ ] All department budget input collected
- [ ] New hire has full setup and training plan
- [ ] Hit gym 3x this week
- [ ] Maintain 7.5+ hour sleep average`,

    'goals-and-vision/README.md': `# Goals and Vision

Long-term direction and annual objectives`,

    'goals-and-vision/annual-goals.md': `# 2025 Annual Goals

## Professional Goals

### 1. Business Growth (Primary)
- **Target**: 50% revenue increase
- **Current**: 32% YTD (ahead of pace)
- **Key initiatives**: Johnson renewal, 3 new major clients
- **Success metric**: $3M ARR by December

### 2. Team Development
- **Target**: Build high-performing 8-person team
- **Current**: 6 people, 2 new hires planned
- **Key initiatives**: Leadership training, mentorship program
- **Success metric**: 95% team satisfaction, zero turnover

## Personal Goals

### 3. Health & Fitness
- **Target**: Run half marathon in October
- **Current**: 5K comfortable, building endurance
- **Key initiatives**: 3x/week training, nutrition plan
- **Success metric**: Sub-2:00 half marathon time

## Q3 Focus Areas
- Johnson presentation and renewal
- Q3 budget planning and execution
- Team expansion and onboarding
- Half marathon training consistency`
  };
  
  // Write initial files
  for (const [filePath, content] of Object.entries(initialFiles)) {
    const fullPath = path.join(PERSONAL_ORG_DIR, filePath);
    await ensureDirectoryExists(path.dirname(fullPath));
    await fs.writeFile(fullPath, content, 'utf8');
  }
  
  console.log('File system initialized with sample content');
}

// File system operations
async function listDirectoryContents(dirPath) {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    return items.map(item => ({
      name: item.name,
      type: item.isDirectory() ? 'folder' : 'file',
      description: item.name === 'README.md' ? 'Folder overview and navigation guide' :
                  item.name.endsWith('.md') ? 'Context file' : 
                  item.isDirectory() ? 'Subfolder' : 'File'
    }));
  } catch (error) {
    throw new Error(`Failed to list directory contents: ${error.message}`);
  }
}

async function readFileContent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const stats = await fs.stat(filePath);
    return {
      content,
      last_updated: stats.mtime.toISOString().split('T')[0],
      file_size: `${(stats.size / 1024).toFixed(1)}KB`
    };
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

async function writeFileContent(filePath, content) {
  try {
    // Ensure directory exists
    await ensureDirectoryExists(path.dirname(filePath));
    
    // Write file
    await fs.writeFile(filePath, content, 'utf8');
    
    const stats = await fs.stat(filePath);
    return {
      success: true,
      message: 'File written successfully',
      last_updated: stats.mtime.toISOString().split('T')[0],
      file_size: `${(stats.size / 1024).toFixed(1)}KB`
    };
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
}

async function deleteFileOrFolder(targetPath) {
  try {
    const stats = await fs.stat(targetPath);
    
    if (stats.isDirectory()) {
      // Check if directory is empty
      const contents = await fs.readdir(targetPath);
      if (contents.length > 0) {
        throw new Error('Cannot delete non-empty directory. Delete contents first or use force option.');
      }
      await fs.rmdir(targetPath);
      return { success: true, message: 'Directory deleted successfully', type: 'directory' };
    } else {
      await fs.unlink(targetPath);
      return { success: true, message: 'File deleted successfully', type: 'file' };
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('File or directory not found');
    }
    throw new Error(`Failed to delete: ${error.message}`);
  }
}

async function getProjectStructure() {
  const structure = {};
  
  async function buildStructure(currentPath, currentObj) {
    try {
      const items = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          currentObj[item.name + '/'] = [];
          await buildStructure(path.join(currentPath, item.name), currentObj[item.name + '/']);
        } else {
          if (!Array.isArray(currentObj)) {
            // Convert to array to hold files
            const keys = Object.keys(currentObj);
            currentObj.length = 0;
            currentObj.push(...keys);
          }
          currentObj.push(item.name);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentPath}:`, error);
    }
  }
  
  await buildStructure(PERSONAL_ORG_DIR, structure);
  return structure;
}

// Function to create fresh server instance for each request
function createServer() {
  const server = new Server(
    {
      name: 'AI Context Service - Persistent Tech Proof',
      version: '2.1.0',
    },
    {
      capabilities: {
        tools: { listChanged: true },
        resources: { subscribe: true, listChanged: true },
        prompts: { listChanged: true }
      },
    }
  );

  // Register tool handlers - 6 Context Navigation Tools (added write_file, delete_file)
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'list_projects',
          description: 'Show available context projects to AI assistant',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'explore_project',
          description: 'Get folder structure overview of a specific project',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { 
                type: 'string', 
                description: 'Project identifier (e.g., personal-organization)' 
              }
            },
            required: ['project_id']
          }
        },
        {
          name: 'list_folder_contents',
          description: 'Show files/folders in a specific project path',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { 
                type: 'string', 
                description: 'Project identifier' 
              },
              folder_path: { 
                type: 'string', 
                description: 'Folder path within project (e.g., current-status)' 
              }
            },
            required: ['project_id', 'folder_path']
          }
        },
        {
          name: 'read_file',
          description: 'Read specific context files',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { 
                type: 'string', 
                description: 'Project identifier' 
              },
              file_path: { 
                type: 'string', 
                description: 'File path within project (e.g., current-status/priorities.md)' 
              }
            },
            required: ['project_id', 'file_path']
          }
        },
        {
          name: 'write_file',
          description: 'Create or update context files (persistent across server restarts)',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { 
                type: 'string', 
                description: 'Project identifier' 
              },
              file_path: { 
                type: 'string', 
                description: 'File path within project (e.g., current-status/new-priorities.md)' 
              },
              content: {
                type: 'string',
                description: 'File content to write'
              }
            },
            required: ['project_id', 'file_path', 'content']
          }
        },
        {
          name: 'delete_file',
          description: 'Delete context files or empty directories',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { 
                type: 'string', 
                description: 'Project identifier' 
              },
              file_path: { 
                type: 'string', 
                description: 'File or directory path within project to delete' 
              }
            },
            required: ['project_id', 'file_path']
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      switch (name) {
        case 'list_projects':
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                projects: [
                  {
                    id: "personal-organization",
                    name: "Personal Organization",
                    description: "Daily planning, projects, and life management (PERSISTENT STORAGE)",
                    status: "implemented",
                    features: ["read", "write", "delete"]
                  },
                  {
                    id: "personal-health",
                    name: "Personal Health",
                    description: "Fitness, nutrition, and wellness tracking",
                    status: "not_implemented"
                  }
                ]
              }, null, 2)
            }]
          };

        case 'explore_project':
          if (!args?.project_id) throw new Error('project_id parameter is required');
          await validateProjectId(args.project_id);

          const structure = await getProjectStructure();
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                project_id: args.project_id,
                structure: structure,
                storage_type: "persistent_file_system",
                capabilities: ["read", "write", "delete"]
              }, null, 2)
            }]
          };

        case 'list_folder_contents':
          if (!args?.project_id || !args?.folder_path) {
            throw new Error('project_id and folder_path parameters are required');
          }
          
          const folderPath = args.folder_path.replace(/^\/+|\/+$/g, '');
          const fullDirPath = await getFilePath(args.project_id, folderPath);
          
          // Check if path exists and is a directory
          try {
            const stats = await fs.stat(fullDirPath);
            if (!stats.isDirectory()) {
              throw new Error(`Path is not a directory: ${folderPath}`);
            }
          } catch (error) {
            if (error.code === 'ENOENT') {
              throw new Error(`Directory not found: ${folderPath}`);
            }
            throw error;
          }

          const contents = await listDirectoryContents(fullDirPath);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                project_id: args.project_id,
                folder_path: folderPath,
                contents: contents,
                storage_type: "persistent_file_system"
              }, null, 2)
            }]
          };

        case 'read_file':
          if (!args?.project_id || !args?.file_path) {
            throw new Error('project_id and file_path parameters are required');
          }
          
          const readFilePath = await getFilePath(args.project_id, args.file_path);
          
          // Check if file exists
          try {
            const stats = await fs.stat(readFilePath);
            if (stats.isDirectory()) {
              throw new Error(`Path is a directory, not a file: ${args.file_path}`);
            }
          } catch (error) {
            if (error.code === 'ENOENT') {
              throw new Error(`File not found: ${args.file_path}`);
            }
            throw error;
          }

          const fileData = await readFileContent(readFilePath);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                project_id: args.project_id,
                file_path: args.file_path,
                content: fileData.content,
                last_updated: fileData.last_updated,
                file_size: fileData.file_size,
                storage_type: "persistent_file_system"
              }, null, 2)
            }]
          };

        case 'write_file':
          if (!args?.project_id || !args?.file_path || args?.content === undefined) {
            throw new Error('project_id, file_path, and content parameters are required');
          }
          
          const writeFilePath = await getFilePath(args.project_id, args.file_path);
          const writeResult = await writeFileContent(writeFilePath, args.content);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                project_id: args.project_id,
                file_path: args.file_path,
                operation: "write",
                success: writeResult.success,
                message: writeResult.message,
                last_updated: writeResult.last_updated,
                file_size: writeResult.file_size,
                storage_type: "persistent_file_system"
              }, null, 2)
            }]
          };

        case 'delete_file':
          if (!args?.project_id || !args?.file_path) {
            throw new Error('project_id and file_path parameters are required');
          }
          
          const deleteFilePath = await getFilePath(args.project_id, args.file_path);
          
          // Check if file/directory exists
          try {
            await fs.access(deleteFilePath);
          } catch (error) {
            if (error.code === 'ENOENT') {
              throw new Error(`File or directory not found: ${args.file_path}`);
            }
            throw error;
          }
          
          const deleteResult = await deleteFileOrFolder(deleteFilePath);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                project_id: args.project_id,
                file_path: args.file_path,
                operation: "delete",
                success: deleteResult.success,
                message: deleteResult.message,
                type: deleteResult.type,
                storage_type: "persistent_file_system"
              }, null, 2)
            }]
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }]
      };
    }
  });

  // Register resource handlers (simplified for tech proof)
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'context://personal-organization',
          name: 'Personal Organization Project (Persistent)',
          description: 'Complete personal organization context data with write/delete capabilities',
          mimeType: 'application/json'
        }
      ]
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    
    if (uri === 'context://personal-organization') {
      const structure = await getProjectStructure();
      return {
        contents: [{
          uri: uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            project_id: "personal-organization",
            structure: structure,
            storage_type: "persistent_file_system",
            capabilities: ["read", "write", "delete"]
          }, null, 2)
        }]
      };
    } else {
      throw new Error(`Unknown resource: ${uri}`);
    }
  });

  // Register prompt handlers
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [{
        name: 'daily_planning',
        description: 'Help plan the day based on current context (with write capability)',
        arguments: [{
          name: 'focus_area',
          description: 'Optional focus area for planning',
          required: false
        }]
      }]
    };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: promptArgs } = request.params;
    
    if (name === 'daily_planning') {
      const focusArea = promptArgs?.focus_area || 'general';
      return {
        description: 'Daily planning prompt with persistent context and write capability',
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Please help me plan my day. Start by exploring my current priorities and context using the navigation tools. You can also update my planning files if needed using the write_file tool. Focus area: ${focusArea}`
          }
        }]
      };
    } else {
      throw new Error(`Unknown prompt: ${name}`);
    }
  });

  return server;
}

// Create Express app (preserve existing architecture)
const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Context Service - Persistent Tech Proof',
    version: '2.1.0',
    transport: 'StreamableHTTP-Stateless',
    features: ['context_navigation', 'persistent_storage', 'write_operations', 'delete_operations'],
    storage: 'file_system'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AI Context Service - Persistent Tech Proof',
    version: '2.1.0',
    transport: 'StreamableHTTP-Stateless',
    endpoints: {
      health: '/health',
      mcp: '/mcp'
    },
    tools: ['list_projects', 'explore_project', 'list_folder_contents', 'read_file', 'write_file', 'delete_file'],
    storage: 'persistent_file_system'
  });
});

// Stateless MCP endpoint - PRESERVE PROVEN ARCHITECTURE
app.all('/mcp', async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  
  try {
    // Create fresh server instance for this request
    const server = createServer();
    
    // Create stateless transport (sessionIdGenerator: undefined)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined // Stateless mode - CRITICAL SUCCESS FACTOR
    });

    // Handle cleanup on request close
    res.on('close', () => {
      console.log('Request closed - cleaning up');
      transport.close();
      server.close();
    });

    // Connect server to transport
    await server.connect(transport);
    console.log('Fresh server/transport created and connected');
    
    // Handle the request
    if (req.method === 'POST') {
      await transport.handleRequest(req, res, req.body);
    } else {
      await transport.handleRequest(req, res);
    }
    console.log('Request handled by stateless transport');
    
  } catch (error) {
    console.error('Stateless MCP error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// Initialize file system on startup
async function startServer() {
  try {
    await initializeFileSystem();
    
    // Start server
    const httpServer = app.listen(PORT, '0.0.0.0', () => {
      console.log(`AI Context Service Persistent Tech Proof running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
      console.log(`Storage: Persistent file system at ${CONTEXT_DATA_DIR}`);
    });

    httpServer.keepAliveTimeout = 65000;
    httpServer.headersTimeout = 66000;
    httpServer.timeout = 0;
    
    return httpServer;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;