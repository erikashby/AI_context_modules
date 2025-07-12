// Copy of working MCP SSE example using official SDK
// Based on nerding-io/mcp-sse-example

const express = require('express');
const cors = require('cors');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');

const PORT = process.env.PORT || 3000;

// Create MCP server
const server = new Server(
  {
    name: 'Hello World MCP Server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: { listChanged: true },
      resources: { subscribe: true, listChanged: true },
      prompts: { listChanged: true }
    },
  }
);

// Define tools using correct SDK syntax
server.setRequestHandler({ method: 'tools/list' }, async () => {
  return {
    tools: [
      {
        name: 'hello',
        description: 'Say hello to someone',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name to greet' }
          },
          required: ['name']
        }
      },
      {
        name: 'echo',
        description: 'Echo back a message',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Message to echo' }
          },
          required: ['message']
        }
      }
    ]
  };
});

server.setRequestHandler({ method: 'tools/call' }, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'hello':
      if (!args?.name) throw new Error('Name parameter is required');
      return {
        content: [{ type: 'text', text: `Hello, ${args.name}! Nice to meet you.` }]
      };
    case 'echo':
      if (!args?.message) throw new Error('Message parameter is required');
      return {
        content: [{ type: 'text', text: `Echo: ${args.message}` }]
      };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Define resources using correct SDK syntax
server.setRequestHandler({ method: 'resources/list' }, async () => {
  return {
    resources: [
      {
        uri: 'hello://world',
        name: 'Hello World',
        description: 'A simple hello world resource',
        mimeType: 'text/plain'
      }
    ]
  };
});

server.setRequestHandler({ method: 'resources/read' }, async (request) => {
  const { uri } = request.params;
  
  if (uri === 'hello://world') {
    return {
      contents: [{
        uri: uri,
        mimeType: 'text/plain',
        text: 'Hello, World! This is a simple MCP resource.'
      }]
    };
  } else {
    throw new Error(`Unknown resource: ${uri}`);
  }
});

// Define prompts using correct SDK syntax
server.setRequestHandler({ method: 'prompts/list' }, async () => {
  return {
    prompts: [{
      name: 'hello_prompt',
      description: 'A friendly greeting prompt',
      arguments: [{
        name: 'name',
        description: 'Name of the person to greet',
        required: true
      }]
    }]
  };
});

server.setRequestHandler({ method: 'prompts/get' }, async (request) => {
  const { name, arguments: promptArgs } = request.params;
  
  if (name === 'hello_prompt') {
    const greetName = promptArgs?.name || 'friend';
    return {
      description: 'A friendly greeting prompt',
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Please greet ${greetName} in a friendly and professional manner.`
        }
      }]
    };
  } else {
    throw new Error(`Unknown prompt: ${name}`);
  }
});

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

let transport;

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Hello World MCP Server (SDK)',
    version: '1.0.0',
    transport: 'SSE'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Hello World MCP Server (SDK)',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      sse: '/sse',
      messages: '/messages'
    }
  });
});

// SSE endpoint using official SDK
app.get("/sse", async (req, res) => {
  console.log('SSE connection requested - using official SDK');
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
  console.log('SSE transport connected via SDK');
});

// Messages endpoint using official SDK
app.post("/messages", async (req, res) => {
  console.log('Message received:', req.body);
  await transport.handlePostMessage(req, res);
});

// Start server
const httpServer = app.listen(PORT, '0.0.0.0', () => {
  console.log(`SDK-based MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`Messages endpoint: http://localhost:${PORT}/messages`);
});

httpServer.keepAliveTimeout = 65000;
httpServer.headersTimeout = 66000;
httpServer.timeout = 0;

module.exports = app;