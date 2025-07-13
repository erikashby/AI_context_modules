// Auth-Protected MCP Server with OAuth 2.1 + PKCE via Auth0
// Based on proven server-persistent.js architecture
// Adds JWT authentication to existing context navigation tools

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const fetch = require('node-fetch');
require('dotenv').config();

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

// Auth0 Configuration - Required Environment Variables
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;

// Validate required environment variables
function validateEnvironment() {
  const required = ['AUTH0_DOMAIN', 'AUTH0_AUDIENCE'];
  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    console.error('Please create a .env file with Auth0 configuration');
    process.exit(1);
  }
  
  console.log('✅ Auth0 environment variables loaded');
  console.log('   Domain:', AUTH0_DOMAIN);
  console.log('   Audience:', AUTH0_AUDIENCE);
}

// File system paths (preserve existing structure)
const CONTEXT_DATA_DIR = path.join(__dirname, 'context-data');
const PERSONAL_ORG_DIR = path.join(CONTEXT_DATA_DIR, 'personal-organization');

// JWT Validation Setup
const jwksClientInstance = jwksClient({
  jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
  requestHeaders: {}, 
  timeout: 30000,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksRequestsPerDay: 100,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000 // 10 minutes
});

// Get signing key for JWT verification
function getKey(header, callback) {
  jwksClientInstance.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('Error getting signing key:', err);
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Extract Bearer token from Authorization header
function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}

// Verify JWT token with Auth0
async function verifyJWT(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      audience: AUTH0_AUDIENCE,
      issuer: `https://${AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err);
        reject(err);
      } else {
        console.log('✅ JWT verified successfully for user:', decoded.sub);
        resolve(decoded);
      }
    });
  });
}

// Check if user has required scope for tool
function hasRequiredScope(userScopes, requiredScope) {
  if (!userScopes || !Array.isArray(userScopes)) {
    return false;
  }
  return userScopes.includes(requiredScope);
}

// Send 401 response with proper WWW-Authenticate header
function send401WithAuthHeader(res, error = 'invalid_token') {
  const authParam = {
    auth_uri: `https://${AUTH0_DOMAIN}/authorize`,
    token_uri: `https://${AUTH0_DOMAIN}/oauth/token`,
    audience: AUTH0_AUDIENCE,
    scope: 'mcp:navigate mcp:read mcp:write mcp:delete mcp:prompt'
  };

  res.status(401).json({
    error: error,
    error_description: error === 'invalid_token' ? 'The access token is invalid' : 'No access token provided',
    'WWW-Authenticate': `Bearer realm="MCP", auth_param="${JSON.stringify(authParam).replace(/"/g, '\\"')}"`,
    auth_param: authParam
  });
}

// JWT Authentication Middleware
async function validateJWT(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    
    if (!token) {
      console.log('❌ No token provided');
      return send401WithAuthHeader(res, 'missing_token');
    }

    // Verify JWT with Auth0
    const decoded = await verifyJWT(token);
    
    // Extract scopes (Auth0 typically puts scopes in 'scope' field as space-separated string)
    const scopes = decoded.scope ? decoded.scope.split(' ') : [];
    
    // Add user context to request
    req.user = decoded;
    req.scopes = scopes;
    
    console.log('✅ Authentication successful');
    console.log('   User:', decoded.sub);
    console.log('   Scopes:', scopes);
    
    next();
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    return send401WithAuthHeader(res, 'invalid_token');
  }
}

// Tool scope requirements mapping
const TOOL_SCOPES = {
  'list_projects': 'mcp:navigate',
  'explore_project': 'mcp:navigate', 
  'list_folder_contents': 'mcp:navigate',
  'read_file': 'mcp:read',
  'write_file': 'mcp:write',
  'delete_file': 'mcp:delete',
  'create_folder': 'mcp:write',
  'delete_folder': 'mcp:delete'
};

// Check tool authorization
function checkToolAuthorization(toolName, userScopes) {
  const requiredScope = TOOL_SCOPES[toolName];
  if (!requiredScope) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  
  if (!hasRequiredScope(userScopes, requiredScope)) {
    throw new Error(`Insufficient permissions: ${requiredScope} scope required for ${toolName}`);
  }
  
  console.log(`✅ Tool ${toolName} authorized with scope ${requiredScope}`);
}

// ================================
// FILE SYSTEM OPERATIONS (PRESERVED FROM server-persistent.js)
// ================================

// Utility functions for file operations (unchanged)
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

// Initialize file system with sample content (preserved from server-persistent.js)
async function initializeFileSystem() {
  console.log('Initializing file system...');
  
  // Ensure base directories exist
  await ensureDirectoryExists(CONTEXT_DATA_DIR);
  await ensureDirectoryExists(PERSONAL_ORG_DIR);
  
  console.log('File system initialized');
}

// File system operations (unchanged)
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
  
  async function buildStructure(currentPath, relativePath = '') {
    try {
      const items = await fs.readdir(currentPath, { withFileTypes: true });
      
      // Separate directories and files
      const directories = [];
      const files = [];
      
      for (const item of items) {
        if (item.isDirectory()) {
          directories.push(item.name);
        } else {
          files.push(item.name);
        }
      }
      
      // Build the current level structure
      const currentLevel = {};
      
      // Add files to current level
      if (files.length > 0) {
        files.forEach(file => {
          currentLevel[file] = 'file';
        });
      }
      
      // Process directories recursively
      for (const dirName of directories) {
        const dirPath = path.join(currentPath, dirName);
        const subStructure = await buildStructure(dirPath, path.join(relativePath, dirName));
        currentLevel[dirName + '/'] = subStructure;
      }
      
      return currentLevel;
      
    } catch (error) {
      console.error(`Error reading directory ${currentPath}:`, error);
      return {};
    }
  }
  
  const result = await buildStructure(PERSONAL_ORG_DIR);
  return result;
}

// ================================
// MCP SERVER CREATION (WITH AUTH CONTEXT)
// ================================

// Function to create fresh server instance for each request (preserved architecture)
function createServer() {
  const server = new Server(
    {
      name: 'AI Context Service - Auth Protected',
      version: '2.4.0',
    },
    {
      capabilities: {
        tools: { listChanged: true },
        resources: { subscribe: true, listChanged: true },
        prompts: { listChanged: true }
      },
    }
  );

  // Register tool handlers with scope-based authorization
  server.setRequestHandler(ListToolsRequestSchema, async (request, extra) => {
    return {
      tools: [
        {
          name: 'list_projects',
          description: 'Show available context projects to AI assistant (requires mcp:navigate)',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'explore_project',
          description: 'Get folder structure overview of a specific project (requires mcp:navigate)',
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
          description: 'Show files/folders in a specific project path (requires mcp:navigate)',
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
          description: 'Read specific context files (requires mcp:read)',
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
          description: 'Create or update context files (requires mcp:write)',
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
          description: 'Delete context files or empty directories (requires mcp:delete)',
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
        },
        {
          name: 'create_folder',
          description: 'Create new directories in the project structure (requires mcp:write)',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { 
                type: 'string', 
                description: 'Project identifier' 
              },
              folder_path: { 
                type: 'string', 
                description: 'Folder path to create (e.g., projects/active/new-project)' 
              }
            },
            required: ['project_id', 'folder_path']
          }
        },
        {
          name: 'delete_folder',
          description: 'Delete directories and their contents (requires mcp:delete)',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { 
                type: 'string', 
                description: 'Project identifier' 
              },
              folder_path: { 
                type: 'string', 
                description: 'Folder path to delete' 
              },
              force: {
                type: 'boolean',
                description: 'Force delete non-empty directory (default: false)',
                default: false
              }
            },
            required: ['project_id', 'folder_path']
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const { name, arguments: args } = request.params;
    
    try {
      // Check authorization for this tool
      checkToolAuthorization(name, extra.scopes);
      
      // Execute tool logic (preserved from server-persistent.js)
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
                    description: "Daily planning, projects, and life management (AUTH PROTECTED)",
                    status: "implemented",
                    features: ["read", "write", "delete"],
                    auth_status: "protected",
                    user: extra.user?.sub || 'unknown'
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
                capabilities: ["read", "write", "delete"],
                auth_status: "protected",
                user: extra.user?.sub || 'unknown'
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
                storage_type: "persistent_file_system",
                auth_status: "protected"
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
                storage_type: "persistent_file_system",
                auth_status: "protected"
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
                storage_type: "persistent_file_system",
                auth_status: "protected",
                user: extra.user?.sub || 'unknown'
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
                storage_type: "persistent_file_system",
                auth_status: "protected",
                user: extra.user?.sub || 'unknown'
              }, null, 2)
            }]
          };

        case 'create_folder':
          if (!args?.project_id || !args?.folder_path) {
            throw new Error('project_id and folder_path parameters are required');
          }
          
          const createFolderPath = await getFilePath(args.project_id, args.folder_path);
          
          // Check if folder already exists
          try {
            await fs.access(createFolderPath);
            throw new Error(`Folder already exists: ${args.folder_path}`);
          } catch (error) {
            if (error.code !== 'ENOENT') {
              throw error; // Re-throw if it's not a "doesn't exist" error
            }
          }
          
          // Create the directory
          try {
            await ensureDirectoryExists(createFolderPath);
            
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  project_id: args.project_id,
                  folder_path: args.folder_path,
                  operation: "create_folder",
                  success: true,
                  message: "Folder created successfully",
                  storage_type: "persistent_file_system",
                  auth_status: "protected",
                  user: extra.user?.sub || 'unknown'
                }, null, 2)
              }]
            };
          } catch (error) {
            throw new Error(`Failed to create folder: ${error.message}`);
          }

        case 'delete_folder':
          if (!args?.project_id || !args?.folder_path) {
            throw new Error('project_id and folder_path parameters are required');
          }
          
          const deleteFolderPath = await getFilePath(args.project_id, args.folder_path);
          
          // Check if folder exists
          try {
            const stats = await fs.stat(deleteFolderPath);
            if (!stats.isDirectory()) {
              throw new Error(`Path is not a directory: ${args.folder_path}`);
            }
          } catch (error) {
            if (error.code === 'ENOENT') {
              throw new Error(`Folder not found: ${args.folder_path}`);
            }
            throw error;
          }
          
          // Check if directory is empty unless force is true
          const force = args.force || false;
          if (!force) {
            try {
              const contents = await fs.readdir(deleteFolderPath);
              if (contents.length > 0) {
                throw new Error(`Cannot delete non-empty directory: ${args.folder_path}. Use force=true to delete with contents, or delete contents first.`);
              }
            } catch (error) {
              if (error.message.includes('Cannot delete non-empty directory')) {
                throw error;
              }
              throw new Error(`Failed to check directory contents: ${error.message}`);
            }
          }
          
          // Delete the directory
          try {
            if (force) {
              // Force delete with contents
              await fs.rm(deleteFolderPath, { recursive: true, force: true });
            } else {
              // Delete empty directory
              await fs.rmdir(deleteFolderPath);
            }
            
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  project_id: args.project_id,
                  folder_path: args.folder_path,
                  operation: "delete_folder",
                  success: true,
                  message: force ? "Folder and contents deleted successfully" : "