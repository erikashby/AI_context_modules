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
// Multi-user paths
const USERS_DIR = path.join(__dirname, 'users');
const MODULES_DIR = path.join(__dirname, 'modules');

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

// Multi-user file path resolution
async function getUserFilePath(username, projectId, filePath) {
  // Sanitize file path to prevent directory traversal
  const sanitizedPath = filePath.replace(/^\/+|\/+$/g, '').replace(/\.\./g, '');
  const userProjectPath = path.join(USERS_DIR, username, 'projects', projectId);
  const fullPath = path.join(userProjectPath, sanitizedPath);
  
  // Ensure path is within user directory (extend existing security)
  const userBasePath = path.join(USERS_DIR, username);
  if (!fullPath.startsWith(userBasePath)) {
    throw new Error('Access denied: Path must be within user directory');
  }
  
  return fullPath;
}

// Original function for backward compatibility
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
  
  // Create comprehensive structure (additive - preserves existing files)
  console.log('Ensuring comprehensive organizational structure exists...');
  
  // Create comprehensive directory structure - CRITICAL for Claude organization
  const directories = [
    'current-status',
    'planning',
    'planning/2025',
    'planning/2025/2025-07-06',
    'planning/templates',
    'projects',
    'projects/active',
    'projects/active/johnson-presentation',
    'projects/active/q3-budget-planning',
    'projects/planning',
    'projects/planning/team-expansion',
    'projects/planning/office-renovation',
    'projects/completed',
    'projects/completed/website-redesign',
    'projects/completed/q2-marketing-campaign',
    'goals-and-vision',
    'goals-and-vision/quarterly',
    'goals-and-vision/monthly',
    'decisions',
    'decisions/pending',
    'decisions/made',
    'resources',
    'resources/templates',
    'resources/reference'
  ];
  
  for (const dir of directories) {
    await ensureDirectoryExists(path.join(PERSONAL_ORG_DIR, dir));
  }
  
  // Create comprehensive initial files - ORGANIZATIONAL FRAMEWORK
  const initialFiles = {
    'README.md': `# Personal Organization

This project contains daily planning, projects, and life management context.

## Folder Structure
- current-status/ - Current priorities and this week's focus
- planning/ - Daily and weekly planning notes, templates
- projects/ - Active, planning, and completed projects
- goals-and-vision/ - Long-term goals, quarterly and monthly objectives
- decisions/ - Pending and made decisions tracking
- resources/ - Templates, references, and reusable content

## How to Use This Structure
1. **Current Status**: Start here for immediate priorities and weekly focus
2. **Planning**: Navigate by year/week for detailed daily and weekly planning
3. **Projects**: Organized by status (active/planning/completed) for project management
4. **Goals & Vision**: Hierarchical goal setting from life vision to monthly objectives
5. **Decisions**: Track important decisions with context and outcomes
6. **Resources**: Templates and reference materials for consistent processes`,

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
- Half marathon training consistency`,

    // Planning structure
    'planning/README.md': `# Planning

Daily and weekly planning notes organized by year and week.

## Structure
- 2025/ - Current year planning
- templates/ - Reusable planning templates

## Usage
- Navigate to specific weeks for detailed daily planning
- Use templates for consistent planning approaches`,

    'planning/2025/README.md': `# 2025 Planning

Weekly planning organized by week starting dates.

## Current Weeks
- 2025-07-06/ - Week of July 6, 2025`,

    'planning/2025/2025-07-06/weekly_notes_2025-07-06.md': `# Weekly Notes - Week of July 6, 2025

## Week Overview
This is execution week - focus on delivering the Johnson presentation and advancing Q3 planning.

## Weekly Priorities
1. **Johnson Presentation** - Complete and deliver by Thursday
2. **Budget Planning** - Collect all department input
3. **Team Development** - Successful new hire onboarding

## Energy Management
- **Peak Focus**: Monday-Wednesday mornings
- **Administrative**: Wednesday afternoons
- **Creative Work**: Tuesday mornings
- **Meetings**: Thursday-Friday

## Weekly Challenges
- Johnson presentation timing is tight
- Coordinating with multiple departments for budget input
- Balancing new hire support with other priorities

## Weekly Wins Target
- Successful presentation delivery
- Complete budget preparation
- New team member feeling welcomed and prepared`,

    'planning/2025/2025-07-06/daily_notes_2025-07-12.md': `# Daily Notes - Friday, July 12, 2025

## Today's Priority
**Main Focus**: Context system testing and validation

## Schedule
- **9:00am**: Team standup
- **10:00am**: Context system development (AI assistant collaboration)
- **12:00pm**: Lunch
- **1:00pm**: System testing and deployment
- **3:00pm**: Documentation and validation
- **4:00pm**: Planning for next phase
- **5:00pm**: Week wrap-up

## Key Tasks
- [x] Test context navigation system
- [x] Implement persistent storage
- [x] Add write/delete capabilities
- [ ] Validate full organizational structure
- [ ] Plan Phase 2 architecture

## Notes
- Context system working excellently with Claude Desktop
- Persistent storage provides foundation for real planning workflows
- Organizational structure critical for AI understanding

## Weekend Prep
- Review week accomplishments
- Plan Monday priorities
- Personal time and family activities`,

    // Projects structure
    'projects/README.md': `# Projects

Organized by status: active, planning, completed

## Structure
- active/ - Currently executing projects
- planning/ - Projects in planning phase
- completed/ - Finished projects with lessons learned

## Project Management Approach
1. **Planning Phase**: Define scope, timeline, resources
2. **Active Phase**: Execute with regular check-ins
3. **Completion Phase**: Document outcomes and lessons`,

    'projects/active/README.md': `# Active Projects

Currently executing projects requiring regular attention.

## Current Active Projects
- johnson-presentation/ - Major client renewal presentation
- q3-budget-planning/ - Quarterly budget allocation planning`,

    'projects/active/johnson-presentation/project-overview.md': `# Johnson Presentation Project

## Project Details
- **Client**: Johnson & Associates
- **Deadline**: Thursday, July 17, 2025 at 2pm
- **Duration**: 30 minutes (25 min presentation + 5 min Q&A)
- **Audience**: 8 senior executives
- **Objective**: Secure $2M contract renewal

## Current Status (95% Complete)
- ✅ Research and data analysis
- ✅ Slide deck structure
- ✅ Key messaging and storyline
- ✅ Supporting data and charts
- 🔄 Final slide polish (in progress)
- ⏳ Practice and timing refinement
- ⏳ Q&A preparation

## Next Actions
- [ ] Complete final slide edits
- [ ] Full practice run with timing
- [ ] Prepare for likely questions
- [ ] Confirm presentation tech setup

## Success Criteria
- Message clarity and impact
- Timing: exactly 25 minutes
- Executive engagement
- Contract renewal commitment`,

    'projects/planning/README.md': `# Planning Projects

Projects in planning phase before execution begins.

## Current Planning Projects
- team-expansion/ - Growing team from 6 to 8 people
- office-renovation/ - Updating workspace for team growth`,

    'projects/completed/README.md': `# Completed Projects

Finished projects with outcomes and lessons learned.

## Recent Completions
- website-redesign/ - Company website overhaul (June 2025)
- q2-marketing-campaign/ - Q2 lead generation campaign (June 2025)`,

    // Goals and vision expanded
    'goals-and-vision/quarterly/README.md': `# Quarterly Goals

Goals broken down by quarter for focused execution.

## 2025 Quarters
- Q3 2025 - Current quarter focus`,

    'goals-and-vision/quarterly/q3-2025-goals.md': `# Q3 2025 Goals

## Quarter Theme: "Scale & Systemize"

## Primary Objectives

### 1. Revenue Acceleration
- **Johnson renewal**: $2M contract (July)
- **New client acquisition**: 2 major prospects (Aug-Sep)
- **Upsell existing clients**: 30% increase target
- **Target**: $750K Q3 revenue

### 2. Operational Excellence
- **Process documentation**: 100% client workflows
- **Team efficiency**: 20% productivity improvement
- **Quality metrics**: <2% error rate
- **Client satisfaction**: 95%+ NPS score

### 3. Team Building
- **New hire integration**: 2 team members
- **Skills development**: Individual growth plans
- **Culture strengthening**: Team events, recognition
- **Leadership pipeline**: Identify future leaders`,

    // Decisions tracking
    'decisions/README.md': `# Decisions

Track important decisions with context and outcomes.

## Structure
- pending/ - Decisions that need to be made
- made/ - Completed decisions with rationale and outcomes

## Decision Framework
1. **Context**: Why is this decision needed?
2. **Options**: What are the alternatives?
3. **Criteria**: How will we evaluate options?
4. **Decision**: What was chosen and why?
5. **Outcome**: How did it work out?`,

    'decisions/pending/README.md': `# Pending Decisions

Decisions that need to be made with deadlines and context.`,

    'decisions/pending/q3-budget-allocation.md': `# Q3 Budget Allocation Decision

## Context
$50K discretionary budget for Q3 needs allocation across departments.

## Options
- A) New marketing campaign ($30K marketing, $20K ops)
- B) Additional developer hire ($40K hiring, $10K equipment)
- C) Office equipment upgrade ($25K equipment, $25K contingency)

## Decision Criteria
- Impact on Q3 revenue targets
- Team productivity improvement
- Long-term strategic value
- Risk level

## Input Needed
- Department priorities survey
- ROI projections for each option
- Team capacity assessment

## Deadline
Friday July 18, 2025

## Status
Gathering input from department heads`,

    // Resources and templates
    'resources/README.md': `# Resources

Templates, references, and reusable content for consistent processes.

## Structure
- templates/ - Reusable templates for common tasks
- reference/ - Reference materials and guides`,

    'resources/templates/README.md': `# Templates

Reusable templates for consistent approaches to common tasks.

## Available Templates
- daily-planning-template.md - Daily planning structure
- weekly-review-template.md - Weekly review format
- project-kickoff-template.md - New project setup
- decision-record-template.md - Decision documentation`,

    'resources/templates/daily-planning-template.md': `# Daily Planning Template

## Date: [YYYY-MM-DD]

## Today's Priority
**Main Focus**: [One key objective for the day]

## Schedule
- **[Time]**: [Activity/Meeting]
- **[Time]**: [Activity/Meeting]
- **[Time]**: [Activity/Meeting]

## Key Tasks
- [ ] [Important task 1]
- [ ] [Important task 2]
- [ ] [Important task 3]

## Notes
[Daily observations, insights, challenges]

## Tomorrow Prep
[What needs to be prepared for tomorrow]`,

    'resources/templates/weekly-review-template.md': `# Weekly Review Template

## Week of [Date Range]

## Weekly Theme
**"[Theme Name]"** - [Brief description of week's focus]

## Accomplishments
- ✅ [Achievement 1]
- ✅ [Achievement 2]
- ✅ [Achievement 3]

## Challenges
- [Challenge 1 and how it was addressed]
- [Challenge 2 and lessons learned]

## Key Metrics
- [Metric 1]: [Result]
- [Metric 2]: [Result]

## Lessons Learned
- [Learning 1]
- [Learning 2]

## Next Week Focus
- [Priority 1]
- [Priority 2]
- [Priority 3]`
  };
  
  // Write initial files (only if they don't exist - preserves existing content)
  for (const [filePath, content] of Object.entries(initialFiles)) {
    const fullPath = path.join(PERSONAL_ORG_DIR, filePath);
    await ensureDirectoryExists(path.dirname(fullPath));
    
    // Only write if file doesn't exist (preserves existing content)
    try {
      await fs.access(fullPath);
      console.log(`Preserving existing file: ${filePath}`);
    } catch {
      await fs.writeFile(fullPath, content, 'utf8');
      console.log(`Created new file: ${filePath}`);
    }
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

// User-scoped handler functions
async function handleListProjects(username) {
  try {
    const userProjectsDir = path.join(USERS_DIR, username, 'projects');
    const projects = await fs.readdir(userProjectsDir);
    
    const projectList = projects.map(project => `• ${project}`).join('\n');
    
    return {
      content: [{ 
        type: 'text', 
        text: `Projects for ${username}:\n${projectList}` 
      }]
    };
  } catch (error) {
    return {
      content: [{ 
        type: 'text', 
        text: `Error listing projects for ${username}: ${error.message}` 
      }],
      isError: true
    };
  }
}

async function handleCreateProject(username, projectName, moduleId) {
  try {
    const modulePath = path.join(MODULES_DIR, moduleId);
    const userProjectPath = path.join(USERS_DIR, username, 'projects', projectName);
    
    // Check if module exists
    await fs.access(modulePath);
    
    // Copy module to user project using our CLI function
    const { copyDirectoryRecursive } = require('./cli-tool.js');
    await copyDirectoryRecursive(modulePath, userProjectPath);
    
    return {
      content: [{ 
        type: 'text', 
        text: `✅ Project '${projectName}' created for ${username} from module '${moduleId}'` 
      }]
    };
  } catch (error) {
    return {
      content: [{ 
        type: 'text', 
        text: `Error creating project: ${error.message}` 
      }],
      isError: true
    };
  }
}

async function handleReadFile(username, projectId, filePath) {
  try {
    const fullPath = await getUserFilePath(username, projectId, filePath);
    const content = await fs.readFile(fullPath, 'utf8');
    
    return {
      content: [{ 
        type: 'text', 
        text: `File: ${filePath}\n\n${content}` 
      }]
    };
  } catch (error) {
    return {
      content: [{ 
        type: 'text', 
        text: `Error reading file: ${error.message}` 
      }],
      isError: true
    };
  }
}

// Function to create fresh server instance for each request
// Create server instance scoped to specific user
function createServerForUser(username) {
  const server = new Server(
    {
      name: 'AI Context Service - Multi-User Tech Proof',
      version: '2.3.1',
    },
    {
      capabilities: {
        tools: { listChanged: true },
        resources: { subscribe: true, listChanged: true },
        prompts: { listChanged: true }
      },
    }
  );

  // Register user-scoped tool handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'list_projects',
          description: `Show available context projects for user ${username}`,
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'create_project',
          description: 'Create new project from module template',
          inputSchema: {
            type: 'object',
            properties: {
              project_name: { type: 'string', description: 'Name for the new project' },
              module_id: { type: 'string', description: 'Module template ID (e.g., personal-effectiveness-v1)' }
            },
            required: ['project_name', 'module_id']
          }
        },
        {
          name: 'read_file',
          description: 'Read specific context files',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { type: 'string', description: 'Project identifier' },
              file_path: { type: 'string', description: 'File path within project' }
            },
            required: ['project_id', 'file_path']
          }
        }
      ]
    };
  });

  // Handle tool calls with user context
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      switch (name) {
        case 'list_projects':
          return await handleListProjects(username);
          
        case 'create_project':
          return await handleCreateProject(username, args.project_name, args.module_id);
          
        case 'read_file':
          return await handleReadFile(username, args.project_id, args.file_path);
          
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  });

  return server;
}

function createServer() {
  const server = new Server(
    {
      name: 'AI Context Service - Persistent Tech Proof',
      version: '2.3.1',
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
        },
        {
          name: 'create_folder',
          description: 'Create new directories in the project structure',
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
          description: 'Delete directories and their contents (use with caution)',
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
                  storage_type: "persistent_file_system"
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
                  message: force ? "Folder and contents deleted successfully" : "Empty folder deleted successfully",
                  force: force,
                  storage_type: "persistent_file_system"
                }, null, 2)
              }]
            };
          } catch (error) {
            throw new Error(`Failed to delete folder: ${error.message}`);
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
    version: '2.3.0',
    transport: 'StreamableHTTP-Stateless',
    features: ['context_navigation', 'persistent_storage', 'write_operations', 'delete_operations', 'folder_management'],
    storage: 'file_system'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AI Context Service - Persistent Tech Proof',
    version: '2.3.0',
    transport: 'StreamableHTTP-Stateless',
    endpoints: {
      health: '/health',
      mcp: '/mcp'
    },
    tools: ['list_projects', 'explore_project', 'list_folder_contents', 'read_file', 'write_file', 'delete_file', 'create_folder', 'delete_folder'],
    storage: 'persistent_file_system'
  });
});

// Stateless MCP endpoint - PRESERVE PROVEN ARCHITECTURE
app.all('/mcp', async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  
  // Extract username from MCP client headers
  const username = req.headers['mcp-username'] || 
                   req.headers['x-mcp-username'] || 
                   'default';
  
  console.log(`MCP request for user: ${username}`);
  
  try {
    // Create fresh server instance for this request with user context
    const server = createServerForUser(username);
    
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