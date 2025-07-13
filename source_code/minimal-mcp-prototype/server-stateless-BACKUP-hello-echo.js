// BACKUP: PROVEN WORKING Hello/Echo MCP Server with Claude Desktop
// STATELESS ARCHITECTURE - StreamableHTTPServerTransport (2025)
// Successfully deployed at: https://ai-context-service-private.onrender.com/mcp
// Last verified working: 2025-07-12
// DO NOT MODIFY - This is our reference implementation

const express = require('express');
const cors = require('cors');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');

const PORT = process.env.PORT || 3000;

// Function to create fresh server instance for each request
function createServer() {
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

  // Register tool handlers
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

  return server;
}

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Hello World MCP Server (Stateless)',
    version: '1.0.0',
    transport: 'StreamableHTTP-Stateless'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Hello World MCP Server (Stateless)',
    version: '1.0.0',
    transport: 'StreamableHTTP-Stateless',
    endpoints: {
      health: '/health',
      mcp: '/mcp'
    }
  });
});

// Stateless MCP endpoint - creates fresh server/transport per request
app.all('/mcp', async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  
  try {
    // Create fresh server instance for this request
    const server = createServer();
    
    // Create stateless transport (sessionIdGenerator: undefined)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined // Stateless mode
    });

    // Handle cleanup on request close
    res.on('close', () => {
      console.log('Request closed - cleaning up');
      transport.close();
      server.close();
    });

    // Connect server to transport
    await server.connect(transport);
    console.log('Fresh server/transport created and connected');
    
    // Handle the request
    if (req.method === 'POST') {
      await transport.handleRequest(req, res, req.body);
    } else {
      await transport.handleRequest(req, res);
    }
    console.log('Request handled by stateless transport');
    
  } catch (error) {
    console.error('Stateless MCP error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// Start server
const httpServer = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Stateless MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});

httpServer.keepAliveTimeout = 65000;
httpServer.headersTimeout = 66000;
httpServer.timeout = 0;

module.exports = app;