# Phase 1 Technical Learnings

## Remote MCP Server Implementation Insights

**Date**: 2025-07-06  
**Context**: Building AI Context Service remote MCP server prototype

### Key Discoveries

#### 1. MCP Protocol Implementation Requirements

**Transport Layer Evolution**:
- **Legacy**: HTTP+SSE (2024-11-05 spec) - persistent connections, limits serverless scaling
- **Current**: Streamable HTTP (2025-03-26 spec) - stateless, better for cloud deployment
- **Reality**: Both transports still required for compatibility

**Critical MCP Methods**:
- `initialize` - Protocol handshake with capability advertisement
- `notifications/initialized` - **REQUIRED** notification after initialization
- `tools/list` - Tool discovery
- `tools/call` - Tool execution
- `resources/list` - Resource discovery  
- `resources/read` - Resource access
- `prompts/list` - Prompt discovery
- `prompts/get` - Prompt retrieval

#### 2. Remote MCP Server Patterns

**Official Server URL Patterns** (from Anthropic documentation):
```
https://mcp.asana.com/sse
https://mcp.atlassian.com/v1/sse  
https://mcp.linear.app/sse
https://mcp.intercom.com/sse
https://mcp.paypal.com/sse
https://api.dashboard.plaid.com/mcp/sse
https://mcp.sentry.dev/sse
https://mcp.squareup.com/sse
```

**Key Pattern**: All production MCP servers use `/sse` endpoints, not `/mcp` or other paths.

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

### Remaining Questions

1. **Response Format Differences**: Why does MCP Inspector work but Claude Desktop doesn't with same server?
2. **Transport Requirements**: Does Claude Desktop require true SSE streaming vs HTTP POST?
3. **Authentication**: When is OAuth 2.1 actually required vs "authless" servers?
4. **Protocol Versions**: Are there Claude Desktop-specific MCP protocol requirements?

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