# Step 1: Context Data System Detailed Development Plan
*Date: July 29, 2025*
*Status: STREAMLINED - Building on Existing Implementation*

## Overview

**Total Effort:** ~4.5 hours
**Approach:** Enhance existing `server-persistent.js` with multi-user support
**Key Simplification:** Username-only (no authentication keys initially)

## Implementation Sequence

### Phase 1: Multi-User File Structure (1 hour)

#### Task 1.1: Add Username from MCP Configuration (30 minutes)
**Objective:** Extract username from remote MCP client configuration (no tool parameter changes needed)

**MCP Configuration Enhancement:**
**User's Claude Desktop Config:**
```json
{
  "mcpServers": {
    "contextservice": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-remote"],
      "env": {
        "MCP_SERVER_URL": "https://ai-context-service-private.onrender.com/mcp",
        "MCP_USERNAME": "erik"
      }
    }
  }
}
```

**Server Enhancement:**
```javascript
// Extract username from MCP client headers (no tool changes needed)
app.all('/mcp', async (req, res) => {
  // Remote MCP client passes env vars as headers
  const username = req.headers['mcp-username'] || 
                   req.headers['x-mcp-username'] || 
                   'default';
  
  console.log(`MCP request for user: ${username}`);
  
  const server = createServerForUser(username); // Pass username to server context
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });
  
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});
```

**Tool Enhancement (NO parameter changes):**
```javascript
// Tools remain unchanged - username comes from server context
{
  name: "list_projects",
  description: "List available context projects"
  // No parameters needed - username from MCP config
}
```

**Benefits:**
- User configures username once in Claude Desktop
- No typing username in every tool call
- Each user connects with their own username automatically
- Multiple users can use same remote server with isolated data

#### Task 1.2: Modify File Path Resolution (30 minutes)
**Objective:** Update existing `getFilePath()` function for multi-user

**Current Code in `server-persistent.js`:**
```javascript
async function getFilePath(projectId, filePath) {
  const sanitizedPath = filePath.replace(/^\/+|\/+$/g, '').replace(/\.\./g, '');
  const fullPath = path.join(PERSONAL_ORG_DIR, sanitizedPath);
  // Security validation...
}
```

**Enhanced Code:**
```javascript
// Username comes from server context, not parameter
function createServerForUser(username) {
  const server = new Server(/* ... existing config ... */);
  
  // Enhanced getFilePath uses username from context
  async function getFilePath(projectId, filePath) {
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
  
  // All tools use the scoped getFilePath function
  return server;
}
```

### Phase 2: Module Template Engine (2 hours)

#### Task 2.1: Create Base Module Structure (45 minutes)
**Objective:** Convert existing `personal-organization/` into `personal-planning-v1` module

**Actions:**
1. Create `/modules/personal-planning-v1/` directory
2. Copy existing `context-data/personal-organization/` structure to module
3. Add basic `module.json` configuration:

```json
{
  "module": {
    "id": "personal-planning-v1",
    "name": "Personal Planning",
    "version": "1.0.0",
    "description": "Personal task management and goal tracking"
  },
  "structure": {
    "current-status": "Immediate priorities and weekly focus",
    "goals-and-vision": "Long-term objectives and vision", 
    "planning": "Time-based planning notes",
    "projects": "Project lifecycle management"
  }
}
```

#### Task 2.2: Implement Simple Module Copying (1 hour 15 minutes)
**Objective:** Basic folder replication functionality

**New Functions:**
```javascript
async function copyDirectoryRecursive(source, destination) {
  await fs.mkdir(destination, { recursive: true });
  const items = await fs.readdir(source, { withFileTypes: true });
  
  for (const item of items) {
    const sourcePath = path.join(source, item.name);
    const destPath = path.join(destination, item.name);
    
    if (item.isDirectory()) {
      await copyDirectoryRecursive(sourcePath, destPath);
    } else {
      await fs.copyFile(sourcePath, destPath);
    }
  }
}

async function createProjectFromModule(username, projectName, moduleId) {
  const modulePath = path.join(MODULES_DIR, moduleId);
  const userProjectPath = path.join(USERS_DIR, username, 'projects', projectName);
  
  // Simple folder copy - no template processing initially
  await copyDirectoryRecursive(modulePath, userProjectPath);
  
  console.log(`Created project '${projectName}' for user '${username}' from module '${moduleId}'`);
  return userProjectPath;
}
```

### Phase 3: CLI Management Tool (1.5 hours)

#### Task 3.1: Create CLI Tool Foundation (45 minutes)
**Objective:** Basic CLI structure for user/project management

**New File:** `cli-tool.js`
```javascript
#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const USERS_DIR = path.join(__dirname, 'users');
const MODULES_DIR = path.join(__dirname, 'modules');

async function createUser(username) {
  const userDir = path.join(USERS_DIR, username);
  await fs.mkdir(path.join(userDir, 'projects'), { recursive: true });
  await fs.mkdir(path.join(userDir, 'profile'), { recursive: true });
  
  const profile = {
    username: username,
    created: new Date().toISOString(),
    projects: []
  };
  
  await fs.writeFile(
    path.join(userDir, 'profile', 'user.json'), 
    JSON.stringify(profile, null, 2)
  );
  
  console.log(`User '${username}' created successfully`);
}

// Command line argument parsing
const command = process.argv[2];
const username = process.argv[3];

switch(command) {
  case 'create-user':
    createUser(username);
    break;
  default:
    console.log('Usage: node cli-tool.js create-user <username>');
}
```

#### Task 3.2: Add Project Management Commands (45 minutes)
**Objective:** Complete CLI functionality

**Additional Commands:**
- `create-project <username> <project-name> <module-id>`
- `list-users`
- `list-projects <username>`
- `validate-structure` - test data integrity

### Phase 4: Testing and Integration (30 minutes)

#### Task 4.1: Integration Testing (15 minutes)
**Test Checklist:**
```bash
# Test user creation
node cli-tool.js create-user alice
node cli-tool.js create-user bob

# Test project creation  
node cli-tool.js create-project alice my-planning personal-planning-v1
node cli-tool.js create-project bob work-stuff personal-planning-v1

# Verify structure
node cli-tool.js validate-structure alice
```

#### Task 4.2: MCP Server Testing (15 minutes)
**Test with enhanced server:**

**Setup Multiple User Configs:**
```json
// Erik's Claude Desktop config
{
  "mcpServers": {
    "contextservice": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-remote"],
      "env": {
        "MCP_SERVER_URL": "https://ai-context-service-private.onrender.com/mcp",
        "MCP_USERNAME": "erik"
      }
    }
  }
}

// Alice's Claude Desktop config (different machine/profile)
{
  "mcpServers": {
    "contextservice": {
      "command": "npx", 
      "args": ["-y", "@modelcontextprotocol/server-remote"],
      "env": {
        "MCP_SERVER_URL": "https://ai-context-service-private.onrender.com/mcp",
        "MCP_USERNAME": "alice"
      }
    }
  }
}
```

**Test Checklist:**
- Start enhanced server with multi-user support
- Test Claude Desktop connection with Erik's config
- Verify Erik sees only his projects (`list_projects` tool)
- Test with Alice's config (simulate different user)
- Confirm user isolation (alice can't see erik's data)
- Verify tools work without username parameters

## Dependencies and Prerequisites

### Required Setup
- Node.js >= 18.0.0 (already installed)
- Existing `minimal-mcp-prototype/` directory
- `@modelcontextprotocol/sdk` (already installed)

### File Structure Changes
```
minimal-mcp-prototype/
├── modules/                    # NEW
│   └── personal-planning-v1/   # Copied from existing structure
├── users/                      # NEW  
│   ├── alice/
│   └── bob/
├── cli-tool.js                 # NEW
├── server-persistent.js        # MODIFIED
└── context-data/               # UNCHANGED (for reference)
    └── personal-organization/
```

## Deliverables

### Primary Deliverables
1. **Enhanced MCP Server** - `server-persistent.js` with multi-user support
2. **Module Template** - `personal-planning-v1` module ready for replication  
3. **CLI Management Tool** - `cli-tool.js` for user/project operations
4. **Test Users** - Alice and Bob with sample projects

### Testing Deliverables
1. **Integration Test Suite** - Validates multi-user isolation
2. **MCP Connection Test** - Confirms Claude Desktop compatibility
3. **Structure Validation** - Ensures proper folder organization

## Success Criteria

### Technical Validation
- [ ] Multiple users can be created via CLI
- [ ] Projects instantiate correctly from module templates
- [ ] MCP tools accept username parameters and scope operations correctly
- [ ] User data isolation prevents cross-user access
- [ ] Claude Desktop integration continues working with enhanced server

### Functional Validation  
- [ ] CLI tool creates users and projects without errors
- [ ] File operations work within user-scoped directories
- [ ] Module copying preserves complete folder structure
- [ ] Performance remains <200ms for context operations

### Quality Validation
- [ ] Code follows existing patterns in `server-persistent.js`
- [ ] Error handling maintains current robustness  
- [ ] Security model extends existing path validation
- [ ] No regression in current MCP tool functionality

## Implementation Notes

### Development Approach
1. **Direct modification** of `server-persistent.js` - no parallel versions
2. **Preserve existing patterns** - extend proven file operation and security code
3. **Simple first** - basic folder copying, add template processing later
4. **Test incrementally** - validate each phase before proceeding

### Key Integration Points
- **MCP tools** - Parameter addition without logic changes
- **File operations** - Path resolution enhancement using existing security patterns
- **Module system** - Standard recursive directory copying
- **CLI tools** - New utility leveraging existing file system operations

### Post-Step 1 Enhancements
- **Authentication keys** - Add when building Web Portal (Step 3)
- **Template processing** - Variable substitution ({{PROJECT_NAME}}, etc.)
- **Advanced modules** - Work projects, health tracking, etc.
- **Module marketplace** - Community-contributed templates