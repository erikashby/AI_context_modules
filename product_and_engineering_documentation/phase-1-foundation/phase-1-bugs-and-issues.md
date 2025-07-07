# Phase 1 Bugs and Issues

## Current Status: Remote MCP Server Transport Implementation

**Date**: 2025-07-07  
**Priority**: High  
**Status**: Nearly Resolved - Using Modern SDK Approach

### Problem Summary

Remote MCP server implementation struggled with transport layer compatibility. Through extensive debugging, discovered that SSE transport is deprecated in 2025 and must use modern StreamableHTTPServerTransport with proper lifecycle management.

### Evolution of the Problem

**Phase 1: Vercel Serverless Issues**
- HTTP POST endpoint worked for MCP protocol but Claude Desktop requires streaming
- Vercel serverless functions cannot maintain persistent SSE connections
- Connection succeeded but no tools displayed

**Phase 2: Railway/Render SSE Attempts** 
- Tried implementing custom SSE servers on Railway and Render
- Claude Desktop connected and sent initialize requests but aborted immediately
- Issue was invalid SSE data format and deprecated transport usage

**Phase 3: SDK Integration Failures**
- Initial SDK attempts failed due to incorrect `setRequestHandler` syntax  
- Discovered SSE transport is deprecated as of 2025
- Required migration to StreamableHTTPServerTransport

### Current Working State (2025-07-07)

**✅ Claude Desktop Connection:**
- Successfully receives POST initialize requests with proper JSON-RPC format
- Makes GET requests for SSE streams  
- Claude Desktop client info: `{ name: 'claude-ai', version: '0.1.0' }`

**✅ MCP Inspector Attempts:**
- Sends initialize requests to `/mcp` endpoint  
- Inspector client info: `{ name: 'inspector-cli', version: '0.5.1' }`

**✅ Modern SDK Implementation:**
- Using `StreamableHTTPServerTransport` (2025 standard)
- Proper schema imports (`ListToolsRequestSchema`, etc.)
- Single persistent transport instance

### Investigation Findings

#### 1. Endpoint Requirements
- **Discovery**: All official MCP servers use `/sse` endpoints
- **Examples from official documentation**:
  - `https://mcp.asana.com/sse`
  - `https://mcp.atlassian.com/v1/sse`
  - `https://mcp.linear.app/sse`
- **Resolution**: Added `/sse` endpoint to our server

#### 2. Missing MCP Methods
- **Discovery**: MCP Inspector revealed missing `notifications/initialized` method
- **Error**: `Unknown method: notifications/initialized`
- **Resolution**: Added notification handler to server
- **Result**: MCP Inspector now works, but Claude Desktop issue persists

#### 3. Response Format Issue (Current)
- **Current State**: Server connects but tools not visible in Claude Desktop
- **Hypothesis**: JSON-RPC response format differs from what Claude Desktop expects
- **Evidence**: Same server works with MCP Inspector but not Claude Desktop

### Technical Details

#### Server Implementation
- **Platform**: Vercel serverless deployment
- **URL**: `https://ai-context-service-private.vercel.app/sse`
- **Protocol**: JSON-RPC 2.0 over HTTP POST
- **Transport**: HTTP (not true SSE streaming)

#### Response Formats (Working with MCP Inspector)
```json
// Initialize Response
{
  "jsonrpc": "2.0",
  "id": 0,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {"listChanged": true},
      "resources": {"subscribe": true, "listChanged": true},
      "prompts": {"listChanged": true}
    },
    "serverInfo": {
      "name": "Hello World MCP Server",
      "version": "1.0.1"
    }
  }
}

// Tools List Response  
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "hello",
        "description": "Say hello to someone",
        "inputSchema": {
          "type": "object",
          "properties": {"name": {"type": "string", "description": "Name to greet"}},
          "required": ["name"]
        }
      }
    ]
  }
}
```

### Critical Discovery: Vercel Serverless SSE Limitation

**Date**: 2025-07-06 Update

#### Key Finding
Vercel serverless functions cannot maintain long-lived SSE connections. The SSE implementation hangs because serverless functions have execution time limits and don't support persistent streaming connections.

#### Transport Compatibility Testing
1. **HTTP POST MCP Server**: ✅ Working perfectly
   - All MCP methods respond correctly (initialize, tools/list, tools/call, etc.)
   - JSON-RPC 2.0 protocol implemented correctly
   - Direct curl testing confirms full functionality

2. **MCP Inspector Tool**: ❌ SSE transport only
   - Inspector expects SSE, fails with HTTP POST servers
   - Returns "Non-200 status code (404)" when trying SSE connection
   - No HTTP POST transport option available

3. **Claude Desktop**: ❌ Likely requires true SSE
   - Based on all official servers using `/sse` endpoints
   - Connection attempts with HTTP POST servers show "connected" but no tools

#### Technical Validation
Our MCP server implementation is **completely correct**:
```bash
# Initialize - Working
curl -X POST https://ai-context-service-private.vercel.app/sse \
  -d '{"jsonrpc": "2.0", "id": 0, "method": "initialize", "params": {...}}'
# Returns proper capabilities and server info

# Tools List - Working  
curl -X POST https://ai-context-service-private.vercel.app/sse \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'
# Returns 2 tools with correct schemas
```

#### Root Cause Analysis
The issue is **transport layer compatibility**, not MCP protocol implementation:
- **Claude Desktop**: Requires true SSE streaming connections
- **Vercel Serverless**: Cannot maintain persistent SSE connections
- **Our Implementation**: Correct MCP logic, wrong transport for platform

### Next Steps

1. **Alternative Hosting**: Test with platforms supporting long-lived connections (AWS Lambda with streaming, DigitalOcean Apps, Railway with persistent containers)
2. **WebSocket Transport**: Investigate if MCP supports WebSocket as alternative to SSE
3. **Hybrid Approach**: Local MCP proxy that bridges to remote HTTP API

### Workaround

Local MCP server works perfectly with Claude Desktop using STDIO transport, confirming our MCP implementation logic is correct.

### Impact

- **Business Validation**: Blocked on core requirement (remote MCP functionality)
- **Technical Risk**: May require different transport implementation or response format
- **Timeline**: Delays validation of remote MCP feasibility

---

*This issue represents the final hurdle in validating remote MCP server functionality for the AI Context Service prototype.*