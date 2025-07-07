# Phase 1 Technical Learnings

## Remote MCP Server Implementation Insights

**Date**: 2025-07-07 (Updated)  
**Context**: Building AI Context Service remote MCP server prototype

### Key Discoveries

#### 1. MCP Protocol Implementation Requirements (2025 UPDATE)

**CRITICAL: Transport Layer Deprecation**:
- **❌ DEPRECATED**: SSE transport (`SSEServerTransport`) as of 2025
- **✅ CURRENT**: Streamable HTTP (`StreamableHTTPServerTransport`) - modern standard
- **⚠️ WARNING**: Do NOT use SSE examples from 2024 - they are obsolete

**Correct 2025 SDK Usage**:
```javascript
// ✅ CORRECT (2025)
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => `session_${Date.now()}_${Math.random()}`,
  enableJsonResponse: false
});

// ❌ WRONG (deprecated)
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
```

**Critical MCP Methods**:
- `initialize` - Protocol handshake with capability advertisement
- `notifications/initialized` - **REQUIRED** notification after initialization
- `tools/list` - Tool discovery
- `tools/call` - Tool execution
- `resources/list` - Resource discovery  
- `resources/read` - Resource access
- `prompts/list` - Prompt discovery
- `prompts/get` - Prompt retrieval

#### 2. Remote MCP Server Patterns (2025 UPDATE)

**Modern Server URL Patterns**:
```
https://server.com/mcp  // Modern StreamableHTTP endpoint
```

**Legacy Server URL Patterns** (still supported but deprecated):
```
https://mcp.asana.com/sse
https://mcp.atlassian.com/v1/sse  
https://mcp.linear.app/sse
```

**Key Changes**: 
- Modern servers use `/mcp` endpoint with StreamableHTTP
- Legacy `/sse` endpoints are deprecated but may still work
- Official SDK handles both GET (streaming) and POST (requests) on same endpoint

#### 3. Claude Desktop Integration Requirements

**Configuration Method**:
- ❌ **JSON config files**: Local servers only (`claude_desktop_config.json`)
- ✅ **Settings > Integrations UI**: Required for remote servers

**Connection Process**:
1. Add server via Claude Desktop Settings > Integrations
2. Provide remote server URL (must use `/sse` endpoint)
3. Claude Desktop performs MCP handshake
4. Tools/resources/prompts appear in UI if successful

#### 4. Development and Testing Tools

**MCP Inspector** (`@modelcontextprotocol/inspector`):
- **Purpose**: Official debugging tool for MCP servers
- **Usage**: `npx @modelcontextprotocol/inspector --cli <URL> --method <method>`
- **Transports**: Supports both HTTP and SSE
- **Value**: Essential for debugging server implementation before Claude Desktop testing

**Example Commands**:
```bash
# Test tools list
npx @modelcontextprotocol/inspector --cli https://server.com/sse --method tools/list

# Test tool execution  
npx @modelcontextprotocol/inspector --cli https://server.com/sse --method tools/call --tool-name hello --tool-arg name=World
```

#### 5. Server Implementation Architecture

**Successful Local Implementation**:
- **Transport**: STDIO (standard input/output)
- **SDK**: `@modelcontextprotocol/sdk/server/index.js`
- **Schema Validation**: Uses official MCP request schemas
- **Result**: Works perfectly with Claude Desktop

**Remote Implementation Challenges**:
- **Transport**: HTTP POST (not true SSE streaming)
- **Platform**: Vercel serverless functions
- **CORS**: Required for browser-based connections
- **Protocol**: JSON-RPC 2.0 over HTTP

#### 6. Hosting Platform Insights

**Railway Issues**:
- Route interception by infrastructure
- Health check endpoint conflicts
- Proxy layer interfering with custom endpoints

**Vercel Success**:
- Clean API endpoint handling
- No route interception
- Proper JSON-RPC request forwarding
- Serverless function compatibility

#### 7. MCP Capabilities Response Format

**Working Format**:
```json
{
  "protocolVersion": "2024-11-05",
  "capabilities": {
    "tools": {
      "listChanged": true
    },
    "resources": {
      "subscribe": true,
      "listChanged": true  
    },
    "prompts": {
      "listChanged": true
    }
  },
  "serverInfo": {
    "name": "Server Name",
    "version": "1.0.0"
  }
}
```

**Critical Flags**:
- `listChanged: true` - Indicates dynamic tool/resource/prompt lists
- `subscribe: true` - Enables resource subscription (for resources)

#### 8. Tool Schema Requirements

**Input Schema Format**:
```json
{
  "name": "tool_name",
  "description": "Tool description",
  "inputSchema": {
    "type": "object",
    "properties": {
      "param": {
        "type": "string", 
        "description": "Parameter description"
      }
    },
    "required": ["param"]
  }
}
```

#### 9. CORS Configuration

**Required Headers**:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

#### 10. Error Handling Patterns

**JSON-RPC Error Format**:
```json
{
  "jsonrpc": "2.0",
  "id": <request_id>,
  "error": {
    "code": -32603,
    "message": "Error description"
  }
}
```

### Implementation Best Practices

#### 1. Start with Local STDIO
- Validate MCP logic with local implementation first
- Use official SDK and schemas
- Test with Claude Desktop locally before remote deployment

#### 2. Use MCP Inspector Extensively  
- Test every MCP method before Claude Desktop integration
- Verify JSON-RPC response formats
- Debug connection and protocol issues

#### 3. Follow Official URL Patterns
- Use `/sse` endpoints for Claude Desktop compatibility
- Study working server URLs from official documentation
- Maintain consistent naming conventions

#### 4. Implement All Required Methods
- Don't skip `notifications/initialized` - it's required
- Implement proper error handling for unknown methods
- Return appropriate JSON-RPC responses

#### 5. Test with Multiple Tools
- MCP Inspector for protocol validation
- Claude Desktop for end-user experience
- Direct HTTP testing for debugging

### Critical Implementation Lessons (2025)

#### 1. **NEVER Create New Transport Per Request**
❌ **Wrong**:
```javascript
app.all('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({...}); // Creates new transport each time!
  await server.connect(transport);
});
```

✅ **Correct**:
```javascript
// Create once, reuse for all requests
let mcpTransport;
async function initializeTransport() {
  if (!mcpTransport) {
    mcpTransport = new StreamableHTTPServerTransport({...});
    await server.connect(mcpTransport);
  }
  return mcpTransport;
}
```

#### 2. **Required Constructor Options**
The `StreamableHTTPServerTransport` constructor requires:
- `sessionIdGenerator`: Function to generate unique session IDs
- `enableJsonResponse`: Set to `false` for SSE streaming (recommended)

#### 3. **SDK Schema Usage**
Use schema objects, not strings:
```javascript
// ✅ Correct
server.setRequestHandler(ListToolsRequestSchema, async () => {...});

// ❌ Wrong  
server.setRequestHandler('tools/list', async () => {...});
```

### Remaining Questions

1. **Final Response Handling**: Ensure transport properly sends responses back to clients
2. **Session Management**: Verify single transport handles multiple concurrent sessions
3. **Error Handling**: Proper error responses for malformed requests

### Technical Architecture Validation

**✅ Proven Concepts**:
- Remote MCP servers are technically feasible
- Cloud hosting (Vercel) works for MCP servers
- JSON-RPC 2.0 over HTTP is supported
- Multiple tools, resources, and prompts can be implemented

**⚠️ Outstanding Issues**:
- Claude Desktop-specific response format requirements
- True SSE vs HTTP POST transport differences
- Production authentication and security requirements

### Business Impact

**Validated**: The core technical concept of remote MCP servers providing context to AI assistants is sound and implementable.

**Risk**: Final integration details may require additional protocol conformance work.

---

*These learnings provide the foundation for production MCP server development and inform the business decision on proceeding with the AI Context Service MVP.*