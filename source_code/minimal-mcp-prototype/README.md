# Minimal MCP Prototype

A minimal Model Context Protocol (MCP) server implementation for validating remote MCP connections with AI assistants like Claude Desktop and ChatGPT.

## Overview

This prototype validates the core technical feasibility of remote MCP servers by implementing:
- **2 MCP Tools**: Simple validation functions (`hello`, `echo`)
- **1 MCP Resource**: Basic resource access (`hello://world`)
- **1 MCP Prompt**: Simple prompt template (`hello_prompt`)
- **Health Check Endpoint**: Render deployment monitoring
- **Stateless Architecture**: StreamableHTTPServerTransport for reliable remote connections

## Architecture

```
AI Assistant (Claude/ChatGPT) ←→ MCP Client ←→ MCP Server (This Code) ←→ Mock Context Data
```

**Transport**: JSON-RPC 2.0 over HTTP with StreamableHTTPServerTransport (2025 standard)
**Architecture**: Stateless - fresh server/transport instances per request
**Authentication**: None (simplified for prototype validation)
**Deployment**: Render.com with `render.yaml` configuration

## Features

### MCP Tools
1. **hello** - Say hello to someone (requires `name` parameter)
2. **echo** - Echo back a message (requires `message` parameter)

### MCP Resources
1. **hello://world** - Simple "Hello, World!" resource for testing connectivity

### MCP Prompts
1. **hello_prompt** - Generate a friendly greeting prompt (accepts optional `name` parameter)

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

The server runs:
- **HTTP Health Check Server** on port 3000 (or PORT env var)
- **MCP Server** via `/mcp` endpoint using StreamableHTTPServerTransport
- **Stateless Architecture** - creates fresh server/transport instances per request

**Health Check Response**:
```json
{
  "status": "ok",
  "service": "Hello World MCP Server (Stateless)",
  "version": "1.0.0",
  "transport": "StreamableHTTP-Stateless"
}
```

## Render Deployment

### Deploy to Render

1. **Connect Repository**:
   - Go to [Render.com](https://render.com)
   - Connect your GitHub repository
   - Select the `source_code/minimal-mcp-prototype` directory

2. **Automatic Deployment**:
   - Render detects Node.js project from `package.json`
   - Uses `render.yaml` configuration for build and deployment
   - Automatically assigns PORT environment variable

3. **Verify Deployment**:
   ```bash
   curl https://your-app.onrender.com/health
   ```

**Current Working Deployment**: `https://ai-context-service-private.onrender.com/mcp`

### Render Configuration

The `render.yaml` file configures:
- **Service Type**: web
- **Environment**: node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check**: `/health` endpoint monitoring

**Environment Variables**:
- `PORT` - Automatically provided by Render
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
           "MCP_SERVER_URL": "https://ai-context-service-private.onrender.com/mcp"
         }
       }
     }
   }
   ```

3. **Test Connection**:
   - Start a new conversation in Claude Desktop
   - Ask: "Say hello to John" or "Echo this message: test"
   - Claude should successfully execute the tools and display responses
   - **Verified Working**: This configuration successfully connects Claude Desktop to the remote MCP server

### ChatGPT Integration

ChatGPT MCP support details to be documented during testing phase.

## API Documentation

### Tools API

**hello**
- Description: Say hello to someone
- Parameters: `name` (string, required) - Name of person to greet
- Returns: Friendly greeting message
- Example: "Hello, John! Nice to meet you."

**echo**
- Description: Echo back a message
- Parameters: `message` (string, required) - Message to echo back
- Returns: The same message prefixed with "Echo:"
- Example: "Echo: test message"

### Resources API

Resources are accessible via MCP protocol using these URIs:
- `hello://world` - Simple "Hello, World!" text resource for connectivity testing

### Prompts API

**hello_prompt**
- Description: Generate a friendly greeting prompt
- Parameters: `name` (string, optional) - Name of person to greet (defaults to "friend")
- Returns: Prompt template for generating friendly greetings
- Example: "Please greet John in a friendly and professional manner."

## Implementation Details

### Stateless Architecture

The key breakthrough was implementing a **stateless architecture** using `StreamableHTTPServerTransport`:

```javascript
// Fresh server/transport created for each request
app.all('/mcp', async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined // Stateless mode - CRITICAL
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});
```

### Key Success Factors
- **sessionIdGenerator: undefined** - Enables stateless operation
- **Fresh instances per request** - Avoids session conflicts
- **Proper cleanup** - Resources cleaned up on request close
- **StreamableHTTPServerTransport** - Uses 2025 standard (not deprecated SSE)

## Development

### Project Structure
```
minimal-mcp-prototype/
├── package.json              # Dependencies and scripts
├── server-stateless.js       # CURRENT: Working stateless MCP server (npm start)
├── server.js                 # Alternative: STDIO transport version
├── server-*.js               # Various implementation attempts
├── render.yaml               # Render deployment configuration
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

### Key Files
- **server-stateless.js**: The working remote MCP server implementation
- **render.yaml**: Deployment configuration for Render.com
- **package.json**: Defines `npm start` to run `server-stateless.js`

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
- [x] Server starts without errors
- [x] Health check endpoint responds
- [x] All 2 tools (`hello`, `echo`) work correctly
- [x] Resource (`hello://world`) is accessible
- [x] Prompt (`hello_prompt`) generates correctly
- [x] Error handling works for invalid requests

**Deployment Testing**:
- [x] Render deployment succeeds
- [x] Remote health check responds at `/health`
- [x] MCP protocol works over public internet
- [x] Stateless architecture handles concurrent requests

**AI Assistant Testing**:
- [x] Claude Desktop connects to remote server
- [x] Tools are visible and executable in Claude Desktop UI
- [x] Connection remains stable during use
- [x] **VERIFIED WORKING**: `https://ai-context-service-private.onrender.com/mcp`

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

**Render Deployment Fails**:
- Check `render.yaml` configuration
- Verify `package.json` has correct start script (`npm start` → `node server-stateless.js`)
- Review Render build logs for errors
- Ensure Node.js version >= 18.0.0 in `package.json` engines

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

**Status**: ✅ **VALIDATION COMPLETE** - This prototype successfully validates that remote MCP servers can reliably connect to AI assistants like Claude Desktop, proving the core technical feasibility for the AI Context Service business model.

**Working Deployment**: `https://ai-context-service-private.onrender.com/mcp`
**Next Phase**: Ready for production architecture with authentication, real data integration, and database layer.