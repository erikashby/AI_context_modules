# Development Plan: Minimal MCP Prototype

## Engineering Management Overview
This document provides detailed development specifications for an AI developer to implement the minimal MCP server prototype. As Engineering Manager, I will oversee the implementation to ensure it meets technical requirements and validation objectives.

## Project Objective
Build a minimal remote MCP server to validate core technical feasibility - specifically that remote MCP connections work reliably with Claude Desktop and ChatGPT without authentication complexity.

## Development Requirements

### Technical Specifications

#### Core Dependencies
```json
{
  "@modelcontextprotocol/sdk": "latest",
  "express": "^4.18.2",
  "cors": "^2.8.5"
}
```

#### Environment Requirements
- **Node.js**: >= 18.0.0
- **Transport**: Streamable HTTP (prioritize over HTTP+SSE)
- **Port**: 3000 (Railway will provide PORT env var)
- **Protocol**: JSON-RPC 2.0

### File Structure Requirements
```
source_code/minimal-mcp-prototype/
├── package.json                 # Dependencies and scripts
├── server.js                    # Main MCP server implementation
├── context-data.json           # Mock context data
├── mcp-config.json             # MCP server configuration
├── README.md                   # Setup and deployment instructions
├── .gitignore                  # Git ignore rules
└── railway.json               # Railway deployment configuration
```

### Implementation Specifications

#### 1. Mock Context Data (context-data.json)
**EXACT SCHEMA REQUIRED:**
```json
{
  "user_profile": {
    "name": "Test User",
    "timezone": "America/New_York",
    "work_schedule": "9am-5pm weekdays",
    "productivity_peak": "morning"
  },
  "current_projects": [
    {
      "id": "proj-1",
      "name": "AI Context Service MVP",
      "status": "in_progress",
      "deadline": "2025-08-15",
      "priority": "high",
      "description": "Building MCP-based context service",
      "next_actions": ["Complete prototype validation", "Test with Claude Desktop"]
    },
    {
      "id": "proj-2", 
      "name": "Market Research Analysis",
      "status": "completed",
      "deadline": "2025-07-01",
      "priority": "medium",
      "description": "Phase 1 market validation research"
    }
  ],
  "upcoming_meetings": [
    {
      "id": "meeting-1",
      "title": "Product Planning Session",
      "date": "2025-07-07",
      "time": "10:00 AM",
      "duration": "60 minutes",
      "participants": ["Erik", "Product Team"],
      "preparation_needed": "Review project status and next quarter priorities"
    },
    {
      "id": "meeting-2",
      "title": "Technical Architecture Review", 
      "date": "2025-07-08",
      "time": "2:00 PM",
      "duration": "90 minutes",
      "participants": ["Erik", "Engineering Team"],
      "preparation_needed": "Prepare MCP prototype demo"
    }
  ],
  "preferences": {
    "communication_style": "direct",
    "work_focus": "deep_work_blocks", 
    "meeting_preference": "morning_blocks",
    "productivity_patterns": "Most creative before lunch, analytical work afternoons"
  },
  "recent_context": [
    {
      "date": "2025-07-06",
      "event": "Started MCP prototype development",
      "details": "Completed technical architecture and began implementation planning"
    }
  ]
}
```

#### 2. MCP Server Configuration (mcp-config.json)
```json
{
  "name": "AI Context Service Prototype",
  "version": "1.0.0",
  "description": "Minimal MCP server for context validation",
  "capabilities": {
    "resources": true,
    "tools": true,
    "prompts": true
  },
  "transport": {
    "type": "streamable-http",
    "port": 3000
  }
}
```

#### 3. Required MCP Tools
**MUST IMPLEMENT these exact tools:**

1. **get_current_projects**
   - **Description**: "Retrieve list of current active projects with status and priorities"
   - **Parameters**: None
   - **Returns**: Array of project objects from current_projects

2. **get_todays_schedule** 
   - **Description**: "Get today's meetings and availability"
   - **Parameters**: None
   - **Returns**: Today's meetings filtered from upcoming_meetings

3. **get_user_preferences**
   - **Description**: "Access user work patterns and communication preferences"
   - **Parameters**: None
   - **Returns**: User preferences object

4. **query_context**
   - **Description**: "Search across all context data for specific information"
   - **Parameters**: 
     - query (string, required): "Search term or question"
   - **Returns**: Relevant context data matching the query

5. **get_project_details**
   - **Description**: "Get detailed information about a specific project"
   - **Parameters**:
     - project_id (string, required): "Project identifier"
   - **Returns**: Full project details or error if not found

#### 4. Required MCP Resources
**MUST IMPLEMENT these exact resources:**

1. **user_profile**
   - **URI**: `context://user_profile`
   - **Name**: "User Profile"
   - **Description**: "Current user's basic profile and work patterns"
   - **MIME Type**: application/json

2. **current_projects**
   - **URI**: `context://current_projects`
   - **Name**: "Current Projects"
   - **Description**: "List of active projects with status and deadlines"
   - **MIME Type**: application/json

3. **upcoming_meetings**
   - **URI**: `context://upcoming_meetings`
   - **Name**: "Upcoming Meetings"
   - **Description**: "Scheduled meetings and calendar events"
   - **MIME Type**: application/json

#### 5. Required MCP Prompts
**MUST IMPLEMENT these exact prompts:**

1. **daily_planning**
   - **Name**: "Daily Planning Assistant"
   - **Description**: "Help plan the day based on schedule, projects, and preferences"
   - **Template**: Includes user schedule, project deadlines, and productivity patterns

2. **project_status**
   - **Name**: "Project Status Summary"
   - **Description**: "Summarize current project status and next actions"
   - **Template**: Project overview with priorities and deadlines

### Server Implementation Requirements

#### Express.js Server Setup
- **Port**: `process.env.PORT || 3000`
- **CORS**: Enable for all origins during prototype
- **JSON parsing**: Support for MCP JSON-RPC requests
- **Error handling**: Basic try/catch with meaningful error messages
- **Logging**: Console.log all MCP requests and responses

#### MCP SDK Integration
- **Transport**: Use StreamableHTTPTransport (not HTTP+SSE)
- **Message handling**: Proper JSON-RPC 2.0 request/response
- **Error codes**: Standard MCP error codes for invalid requests
- **Capability advertising**: Correctly advertise tools, resources, and prompts

#### Health Check Endpoint
- **Route**: `GET /health`
- **Response**: `{"status": "ok", "timestamp": "ISO-8601-date"}`
- **Purpose**: Railway health monitoring

### Deployment Configuration

#### Railway Configuration (railway.json)
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

#### Environment Variables
- **PORT**: Provided by Railway
- **NODE_ENV**: Set to "production" for Railway deployment

### Testing Requirements

#### Manual Testing Checklist
**Developer MUST verify:**
1. ✅ Server starts without errors
2. ✅ Health check endpoint responds
3. ✅ MCP capabilities are properly advertised
4. ✅ All 5 tools return correct data
5. ✅ All 3 resources are accessible
6. ✅ All 2 prompts are available
7. ✅ JSON-RPC 2.0 format compliance
8. ✅ Error handling for invalid requests

#### Local Testing Commands
```bash
# Install dependencies
npm install

# Start server
npm start

# Test health endpoint
curl http://localhost:3000/health

# Test MCP capabilities (manual MCP client test)
```

### Quality Requirements

#### Code Quality Standards
- **Error Handling**: All async operations wrapped in try/catch
- **Input Validation**: Validate all tool parameters
- **Logging**: Log all requests, responses, and errors
- **Comments**: Document all MCP handlers and complex logic
- **Constants**: No hardcoded strings - use constants for tool names, etc.

#### Performance Requirements
- **Startup**: Server must start within 10 seconds
- **Response Time**: All tool responses under 1 second
- **Memory**: Stay under 100MB memory usage
- **Error Rate**: No unhandled exceptions

### Acceptance Criteria

#### Functional Requirements
1. ✅ MCP server starts and advertises capabilities correctly
2. ✅ All tools return expected data from context-data.json
3. ✅ All resources are accessible via MCP protocol
4. ✅ All prompts are available and properly formatted
5. ✅ Health check endpoint works for Railway monitoring
6. ✅ Error handling works for invalid requests

#### Technical Requirements
1. ✅ Uses official @modelcontextprotocol/sdk
2. ✅ Implements Streamable HTTP transport
3. ✅ Follows JSON-RPC 2.0 specification
4. ✅ Railway deployment configuration is correct
5. ✅ No authentication (as specified for prototype)
6. ✅ CORS enabled for testing with AI assistants

## Engineering Manager Review Process

### Code Review Checklist
**I will verify:**
- [ ] All required files are present with correct structure
- [ ] Mock data exactly matches specified schema
- [ ] All 5 tools are implemented correctly
- [ ] All 3 resources are accessible
- [ ] All 2 prompts are properly configured
- [ ] Error handling is comprehensive
- [ ] Railway deployment configuration is correct
- [ ] Code follows quality standards

### Testing Verification
**I will test:**
- [ ] Local server startup and health check
- [ ] MCP capability advertisement
- [ ] Each tool's functionality and response format
- [ ] Resource accessibility
- [ ] Prompt availability
- [ ] Error handling for edge cases

### Deployment Validation
**I will verify:**
- [ ] Railway deployment succeeds
- [ ] Remote server is accessible via HTTPS
- [ ] Health check endpoint works on deployed server
- [ ] MCP protocol works over public internet

## Developer Success Criteria

The AI developer will be considered successful when:

1. **All code passes Engineering Manager review**
2. **Server deploys successfully to Railway**
3. **All manual tests pass**
4. **Remote MCP server is accessible from AI assistants**
5. **Documentation is complete and accurate**

## Next Steps After Development

Once the developer completes implementation:
1. **Engineering Manager review and approval**
2. **Railway deployment and testing**
3. **Claude Desktop connection testing**
4. **ChatGPT connection testing (if supported)**
5. **Performance and reliability validation**
6. **Documentation of findings for next phase**

---

**Note to Developer**: Follow this specification exactly. Any deviations or questions should be discussed with the Engineering Manager before implementation. The goal is to validate MCP connectivity, not to build a production system.