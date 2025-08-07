# Step 1: Context Data System Architecture
*Date: July 29, 2025*
*Status: UPDATED - Building on Existing Implementation*

## Overview

Step 1 extends the existing validated MCP server implementation (`source_code/minimal-mcp-prototype/`) from single-user to multi-user architecture while preserving the proven technical patterns.

**Current Foundation:**
- Working MCP server with file system persistence
- Established context structure (`context-data/personal-organization/`)
- Navigation tools (list_projects, explore_project, list_folder_contents, read_file)
- Deployed and validated with Claude Desktop integration

**Step 1 Enhancement:**
- Multi-user folder isolation based on existing structure
- Module template system using established context patterns
- User authentication via file system keys
- CLI tools for user/project management

## File System Structure

### Current Single-User Structure
```
minimal-mcp-prototype/
└── context-data/
    └── personal-organization/           # Existing working structure
        ├── current-status/
        ├── goals-and-vision/
        ├── planning/
        └── projects/
```

### Enhanced Multi-User Structure
```
ai-context-service/
├── modules/                             # Module templates (NEW)
│   ├── personal-planning-v1/            # Based on existing personal-organization
│   │   ├── configuration/
│   │   │   ├── module.json
│   │   │   └── project-template.json
│   │   ├── fixed-content/               # Immutable templates
│   │   │   ├── README.md
│   │   │   └── templates/
│   │   └── content-structure/           # User content areas
│   │       ├── current-status/          # Mirror existing structure
│   │       ├── goals-and-vision/
│   │       ├── planning/
│   │       └── projects/
│   └── work-project-v1/                 # Additional modules
├── users/                               # Multi-user structure (NEW)
│   ├── {username}/
│   │   ├── auth/
│   │   │   └── user.key                 # Authentication key
│   │   ├── projects/                    # User's project instances
│   │   │   └── my-personal-planning/    # Created from personal-planning-v1
│   │   │       ├── current-status/      # Mirrors existing structure
│   │   │       ├── goals-and-vision/
│   │   │       ├── planning/
│   │   │       └── projects/
│   │   └── profile/
│   │       └── preferences.json
└── system/                              # System configuration (NEW)
    └── config.json
```

## User Management

### Authentication System
**Extends existing file path validation patterns:**

```javascript
// Current: Path sanitization in server-persistent.js
async function getFilePath(projectId, filePath) {
  const sanitizedPath = filePath.replace(/^\/+|\/+$/g, '').replace(/\.\./g, '');
  // Enhanced: Add user isolation
  const userProjectPath = path.join(USERS_DIR, username, 'projects', projectId);
  const fullPath = path.join(userProjectPath, sanitizedPath);
  return fullPath;
}

// NEW: User validation
async function validateUser(username, key) {
  const keyPath = path.join(USERS_DIR, username, 'auth', 'user.key');
  const storedKey = await fs.readFile(keyPath, 'utf8');
  return storedKey.trim() === key;
}
```

### User Creation Process
1. Create user folder structure: `/users/{username}/`
2. Generate unique authentication key
3. Store key in `/users/{username}/auth/user.key`
4. Initialize user profile and preferences

## Module System

### Template Engine Design
**Builds on existing context structure patterns:**

```javascript
// NEW: Module instantiation using established patterns
async function createProjectFromModule(username, projectName, moduleId) {
  const modulePath = path.join(MODULES_DIR, moduleId);
  const userProjectPath = path.join(USERS_DIR, username, 'projects', projectName);
  
  // Copy module structure (mirrors existing directory patterns)
  await copyModuleStructure(modulePath, userProjectPath);
  
  // Process templates with user context
  await processTemplateFiles(userProjectPath, {
    PROJECT_NAME: projectName,
    USER_NAME: username,
    CREATION_DATE: new Date().toISOString()
  });
  
  return userProjectPath;
}
```

### Module Templates
**personal-effectiveness-v1 Module** (based on existing personal-organization):

```
personal-effectiveness-v1/
├── module.json
├── AI_instructions/
│   ├── README.md
│   └── project-context.md
├── current-status/
│   ├── priorities.md
│   ├── energy-patterns.md
│   ├── this-week.md
│   └── blockers.md
├── effectiveness-patterns/
│   ├── productive-times.md
│   ├── meeting-preferences.md
│   ├── deep-work-blocks.md
│   └── decision-patterns.md
├── goals-and-vision/
│   ├── annual-goals.md
│   ├── quarterly-focus.md
│   └── life-vision.md
├── planning/
│   ├── README.md
│   └── 2025/
│       └── 07-july/
│           ├── month_plan.md
│           └── week-5/
│               ├── week_plan.md
│               └── day_29.md
├── projects/
│   ├── active/
│   │   └── README.md
│   ├── planning/
│   │   └── README.md
│   └── completed/
│       └── README.md
└── insights/
    ├── what-works.md
    ├── lessons-learned.md
    └── experiments.md
```

**Key Features:**
- **Source**: Current `context-data/personal-organization/` structure enhanced for effectiveness intelligence
- **AI_instructions/**: Project-specific AI guidance and behavior rules
- **Hierarchical planning**: `planning/year/month/week` structure with sample 2025/07-july/week-5
- **Effectiveness focus**: Patterns, insights, and optimization data for AI recommendations
- **Self-documenting**: README.md files explain structure and navigation patterns

## Performance Considerations

### Leveraging Existing Optimizations
**Current proven patterns:**
- Stateless architecture with fresh instances per request
- File system caching in `server-persistent.js`
- Path sanitization and security validation
- Async file operations with error handling

**Step 1 Enhancements:**
```javascript
// User-scoped caching (extends existing patterns)
const userContextCache = new Map();

async function getCachedUserContext(username, projectName) {
  const cacheKey = `${username}:${projectName}`;
  if (userContextCache.has(cacheKey)) {
    return userContextCache.get(cacheKey);
  }
  
  // Use existing file reading patterns
  const context = await readProjectContext(username, projectName);
  userContextCache.set(cacheKey, context, { ttl: 300000 }); // 5min cache
  return context;
}
```

## Security Model

### Multi-User Isolation
**Extends existing security patterns:**

```javascript
// Current: Directory traversal prevention
if (!fullPath.startsWith(PERSONAL_ORG_DIR)) {
  throw new Error('Invalid file path: Path must be within project directory');
}

// Enhanced: User isolation
const userBasePath = path.join(USERS_DIR, username);
if (!fullPath.startsWith(userBasePath)) {
  throw new Error('Access denied: Path must be within user directory');
}
```

### Authentication Flow
1. **User provides**: username + key in MCP connection
2. **System validates**: key against `/users/{username}/auth/user.key`
3. **Access granted**: Only to `/users/{username}/` subtree
4. **Operations scoped**: All file operations user-isolated

## API Design

### Enhanced MCP Tools
**Extends existing navigation tools:**

```javascript
// Current: list_projects, explore_project, list_folder_contents, read_file
// Enhanced: Add user context and project creation

{
  name: "create_project",
  description: "Create new project from module template",
  inputSchema: {
    type: "object",
    properties: {
      project_name: { type: "string" },
      module_id: { type: "string" },
      username: { type: "string" },
      auth_key: { type: "string" }
    }
  }
}
```

### File Operations API
**Builds on existing file system patterns:**
- `createUser(username, preferences)` → user_key
- `createProject(username, projectName, moduleId)` → project_path
- `getUserProjects(username)` → project_list
- `validateUserAccess(username, key)` → boolean

## Testing Strategy

### CLI Testing Tool
**Extends existing validation patterns:**

```bash
# Step 1 CLI tool for validation
npm run test-step1

# Test user management
node cli-tool.js create-user alice --preferences="{\"theme\":\"personal\"}"
node cli-tool.js validate-user alice <generated-key>

# Test project creation
node cli-tool.js create-project alice my-planning personal-planning-v1
node cli-tool.js list-projects alice

# Test file operations
node cli-tool.js read-file alice my-planning current-status/priorities.md
```

### Integration Testing
1. **User isolation**: Verify users cannot access each other's data
2. **Module instantiation**: Confirm templates copy correctly
3. **MCP compatibility**: Ensure tools work with existing Claude Desktop setup
4. **Performance**: Validate <200ms response times with multi-user data

### Migration Testing
1. **Existing data preservation**: Current `context-data/` remains functional
2. **Backward compatibility**: Existing MCP tools continue working
3. **Deployment continuity**: `server-persistent.js` enhanced, not replaced

## Implementation Notes

### Development Approach
1. **Enhance existing server**: Modify `server-persistent.js` with multi-user support
2. **Preserve working patterns**: Keep proven stateless architecture and navigation tools
3. **Additive changes**: New functionality extends existing rather than replacing
4. **Maintain deployment**: Build on current Render.com deployment success

### Key Integration Points
- **Existing MCP tools**: Enhanced with user context, maintain API compatibility
- **File system patterns**: User isolation layer over proven file operations
- **Context structure**: Module templates based on working `personal-organization/` hierarchy
- **Security model**: Extension of current path validation and sanitization