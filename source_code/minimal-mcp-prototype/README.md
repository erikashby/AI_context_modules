# Minimal MCP Prototype

A minimal Model Context Protocol (MCP) server implementation for validating remote MCP connections with AI assistants like Claude Desktop and ChatGPT.

## Overview

This prototype validates the core technical feasibility of remote MCP servers by implementing:
- **5 MCP Tools**: Context query and retrieval functions
- **3 MCP Resources**: Static context data access
- **2 MCP Prompts**: Context-aware prompt templates
- **Health Check Endpoint**: Railway deployment monitoring

## Architecture

```
AI Assistant (Claude/ChatGPT) ←→ MCP Client ←→ MCP Server (This Code) ←→ Mock Context Data
```

**Transport**: JSON-RPC 2.0 over HTTP with Streamable HTTP transport
**Authentication**: None (simplified for prototype validation)

## Features

### MCP Tools
1. **get_current_projects** - Retrieve active projects with status and priorities
2. **get_todays_schedule** - Get today's meetings and availability  
3. **get_user_preferences** - Access user work patterns and communication preferences
4. **query_context** - Search across all context data for specific information
5. **get_project_details** - Get detailed information about a specific project

### MCP Resources
1. **user_profile** (`context://user_profile`) - User's basic profile and work patterns
2. **current_projects** (`context://current_projects`) - List of active projects with status and deadlines
3. **upcoming_meetings** (`context://upcoming_meetings`) - Scheduled meetings and calendar events

### MCP Prompts
1. **daily_planning** - Help plan the day based on schedule, projects, and preferences
2. **project_status** - Summarize current project status and next actions

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Local Development

1. **Clone and setup**:
   ```bash
   cd source_code/minimal-mcp-prototype
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Verify health check**:
   ```bash
   curl http://localhost:3000/health
   ```

### Testing MCP Functionality

The server runs both:
- **HTTP Health Check Server** on port 3000 (or PORT env var)
- **MCP Server** via STDIO transport for MCP client connections

**Health Check Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-07-06T...",
  "service": "AI Context Service MCP Server",
  "version": "1.0.0"
}
```

## Railway Deployment

### Deploy to Railway

1. **Connect Repository**:
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `source_code/minimal-mcp-prototype` directory

2. **Automatic Deployment**:
   - Railway detects Node.js project from `package.json`
   - Uses `railway.json` configuration for build and deployment
   - Automatically assigns PORT environment variable

3. **Verify Deployment**:
   ```bash
   curl https://your-app.railway.app/health
   ```

### Railway Configuration

The `railway.json` file configures:
- **Builder**: NIXPACKS (automatic Node.js detection)
- **Start Command**: `npm start`
- **Health Check**: `/health` endpoint monitoring

**Environment Variables**:
- `PORT` - Automatically provided by Railway
- `NODE_ENV` - Set to "production" for deployed environment

## AI Assistant Integration

### Claude Desktop Setup

1. **Install Claude Desktop** from [claude.ai/desktop](https://claude.ai/desktop)

2. **Configure MCP Server** in Claude Desktop settings:
   ```json
   {
     "mcpServers": {
       "contextservice": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-remote"],
         "env": {
           "MCP_SERVER_URL": "https://your-app.railway.app"
         }
       }
     }
   }
   ```

3. **Test Connection**:
   - Start a new conversation in Claude Desktop
   - Ask: "What are my current projects?"
   - Claude should retrieve and display mock project data

### ChatGPT Integration

ChatGPT MCP support details to be documented during testing phase.

## API Documentation

### Tools API

**get_current_projects**
- Description: Retrieve list of current active projects
- Parameters: None
- Returns: Array of project objects with status and priorities

**get_todays_schedule**
- Description: Get today's meetings and availability
- Parameters: None  
- Returns: Today's meetings filtered by current date

**get_user_preferences**
- Description: Access user work patterns and communication preferences
- Parameters: None
- Returns: User preferences object

**query_context**
- Description: Search across all context data
- Parameters: `query` (string, required) - Search term or question
- Returns: Relevant context data matching the query

**get_project_details**
- Description: Get detailed information about a specific project
- Parameters: `project_id` (string, required) - Project identifier
- Returns: Full project details or error if not found

### Resources API

Resources are accessible via MCP protocol using these URIs:
- `context://user_profile` - User profile and work patterns
- `context://current_projects` - Active projects list
- `context://upcoming_meetings` - Scheduled meetings

### Prompts API

**daily_planning**
- Generates context-aware daily planning prompts
- Includes user schedule, project deadlines, and productivity patterns

**project_status**
- Generates project status summary prompts
- Includes project overview with priorities and deadlines

## Mock Data Schema

The prototype uses realistic mock data in `context-data.json`:

```json
{
  "user_profile": {
    "name": "Test User",
    "timezone": "America/New_York",
    "work_schedule": "9am-5pm weekdays",
    "productivity_peak": "morning"
  },
  "current_projects": [...],
  "upcoming_meetings": [...],
  "preferences": {...},
  "recent_context": [...]
}
```

## Development

### Project Structure
```
minimal-mcp-prototype/
├── package.json              # Dependencies and scripts
├── server.js                 # Main MCP server implementation
├── context-data.json        # Mock context data
├── mcp-config.json          # MCP server configuration
├── railway.json             # Railway deployment config
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

### Key Dependencies
- `@modelcontextprotocol/sdk` - Official MCP SDK
- `express` - HTTP server for health checks
- `cors` - CORS middleware for browser testing

### Error Handling

The server implements comprehensive error handling:
- **Tool Execution**: Try/catch with meaningful error messages
- **Resource Access**: Validation and error responses
- **Health Checks**: Graceful error reporting
- **Graceful Shutdown**: SIGINT/SIGTERM signal handling

### Logging

All MCP operations are logged for debugging:
- Tool calls with parameters
- Resource access requests
- Prompt generation requests
- Health check requests
- Error conditions

## Testing

### Manual Testing Checklist

**Local Testing**:
- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] All 5 tools return correct mock data
- [ ] All 3 resources are accessible
- [ ] All 2 prompts generate correctly
- [ ] Error handling works for invalid requests

**Deployment Testing**:
- [ ] Railway deployment succeeds
- [ ] Remote health check responds
- [ ] MCP protocol works over public internet

**AI Assistant Testing**:
- [ ] Claude Desktop connects to remote server
- [ ] Context data is retrieved correctly in conversations
- [ ] Connection remains stable during use

### Performance Metrics

**Target Requirements**:
- Startup time: < 10 seconds
- Tool response time: < 1 second
- Memory usage: < 100MB
- Error rate: 0% for valid requests

## Troubleshooting

### Common Issues

**Server Won't Start**:
- Check Node.js version (>=18.0.0 required)
- Verify dependencies installed: `npm install`
- Check port availability (default 3000)

**Health Check Fails**:
- Verify server is running: `npm start`
- Check URL: `curl http://localhost:3000/health`
- Review logs for error messages

**MCP Connection Issues**:
- Verify MCP SDK version compatibility
- Check JSON-RPC 2.0 message format
- Review server logs for MCP request/response details

**Railway Deployment Fails**:
- Check `railway.json` configuration
- Verify `package.json` has correct start script
- Review Railway build logs for errors

### Debug Mode

Enable verbose logging by setting environment variable:
```bash
DEBUG=mcp:* npm start
```

## Limitations

This is a **prototype for validation**, not a production system:

- **No Authentication**: Public endpoint accessible without authentication
- **Mock Data Only**: Uses hardcoded sample data, not real user context
- **No Database**: All data is in-memory, resets on restart
- **Basic Error Handling**: Minimal retry logic and failover mechanisms
- **No Rate Limiting**: No protection against abuse or DoS

## Next Steps

After successful validation:

1. **Authentication Implementation**: OAuth 2.1 + PKCE integration
2. **Real Data Integration**: Calendar, email, project management APIs
3. **Database Layer**: Persistent context storage and caching
4. **Production Architecture**: Multi-tenant, scalable deployment
5. **Monitoring & Alerting**: Production-ready observability

## Support

For technical issues or questions:
- Review this README and troubleshooting section
- Check server logs for detailed error information
- Verify all requirements and dependencies are met
- Test with the manual testing checklist

## License

MIT License - See package.json for details.

---

**Note**: This prototype validates the core technical assumption that remote MCP servers can reliably provide context to AI assistants, enabling the AI Context Service business model.