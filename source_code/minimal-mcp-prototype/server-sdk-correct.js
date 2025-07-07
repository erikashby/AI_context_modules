// Correct MCP SDK implementation using proper API
const express = require('express');
const cors = require('cors');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');

const PORT = process.env.PORT || 3000;

// Create MCP server with proper SDK
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

// Register tool handlers using correct SDK API
server.setRequestHandler(ListToolsRequestSchema, async () => {
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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
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

// Register resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
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

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
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

// Register prompt handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => {
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

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
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

const transports = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Hello World MCP Server (SDK)',
    version: '1.0.0',
    transport: 'SSE',
    activeSessions: transports.size
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
  try {
    const transport = new SSEServerTransport("/messages", res);
    const sessionId = `session_${Date.now()}_${Math.random()}`;
    
    // Store transport for this session
    transports.set(sessionId, transport);
    console.log(`Created transport for session: ${sessionId}`);
    
    // Connect server to transport
    await server.connect(transport);
    console.log('SSE transport connected via SDK');
    
    // Clean up on disconnect
    res.on('close', () => {
      console.log(`Session closed: ${sessionId}`);
      transports.delete(sessionId);
    });
    
  } catch (error) {
    console.error('SDK SSE connection error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Messages endpoint using official SDK
app.post("/messages", async (req, res) => {
  console.log('Message received:', req.body);
  try {
    // Find the most recent transport (simplified approach)
    const transportArray = Array.from(transports.values());
    const transport = transportArray[transportArray.length - 1];
    
    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(400).json({ error: 'No SSE transport available' });
    }
  } catch (error) {
    console.error('SDK message handling error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
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