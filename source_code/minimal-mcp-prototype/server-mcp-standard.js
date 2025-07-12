const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3000;

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Hello World MCP Server',
    version: '1.0.0',
    transport: 'SSE'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Hello World MCP Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      sse: '/sse'
    }
  });
});

// MCP SSE endpoint following official specification
app.get('/sse', (req, res) => {
  console.log('SSE connection established');
  
  // Set proper SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });

  // Send endpoint notification (standard MCP SSE pattern)
  res.write(`event: endpoint\n`);
  res.write(`data: /message\n\n`);

  // Send server capabilities as an event
  const capabilities = {
    jsonrpc: '2.0',
    id: null,
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: true
        },
        resources: {
          subscribe: true,
          listChanged: true
        },
        prompts: {
          listChanged: true
        }
      },
      serverInfo: {
        name: 'Hello World MCP Server',
        version: '1.0.0'
      }
    }
  };

  res.write(`event: message\n`);
  res.write(`data: ${JSON.stringify(capabilities)}\n\n`);
  
  console.log('Sent capabilities via SSE');

  // Keep connection alive with periodic pings
  const keepAlive = setInterval(() => {
    if (!res.destroyed) {
      try {
        res.write(`event: ping\n`);
        res.write(`data: ${Date.now()}\n\n`);
      } catch (error) {
        console.log('SSE connection closed');
        clearInterval(keepAlive);
      }
    } else {
      clearInterval(keepAlive);
    }
  }, 30000);

  // Handle client disconnect
  req.on('close', () => {
    console.log('SSE connection closed by client');
    clearInterval(keepAlive);
  });

  req.on('aborted', () => {
    console.log('SSE connection aborted by client');
    clearInterval(keepAlive);
  });

  res.on('close', () => {
    console.log('SSE response stream closed');
    clearInterval(keepAlive);
  });
});

// Message endpoint for MCP JSON-RPC requests
app.post('/message', (req, res) => {
  const { method, params, id } = req.body;
  console.log(`MCP Request: ${method}`, params);
  
  try {
    let result;
    
    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: true },
            resources: { subscribe: true, listChanged: true },
            prompts: { listChanged: true }
          },
          serverInfo: {
            name: 'Hello World MCP Server',
            version: '1.0.0'
          }
        };
        break;
        
      case 'tools/list':
        result = {
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
        break;
        
      case 'tools/call':
        const { name, arguments: args } = params;
        switch (name) {
          case 'hello':
            if (!args?.name) throw new Error('Name parameter is required');
            result = {
              content: [{ type: 'text', text: `Hello, ${args.name}! Nice to meet you.` }]
            };
            break;
          case 'echo':
            if (!args?.message) throw new Error('Message parameter is required');
            result = {
              content: [{ type: 'text', text: `Echo: ${args.message}` }]
            };
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        break;
        
      case 'resources/list':
        result = {
          resources: [
            {
              uri: 'hello://world',
              name: 'Hello World',
              description: 'A simple hello world resource',
              mimeType: 'text/plain'
            }
          ]
        };
        break;
        
      case 'resources/read':
        const { uri } = params;
        if (uri === 'hello://world') {
          result = {
            contents: [{
              uri: uri,
              mimeType: 'text/plain',
              text: 'Hello, World! This is a simple MCP resource.'
            }]
          };
        } else {
          throw new Error(`Unknown resource: ${uri}`);
        }
        break;
        
      case 'prompts/list':
        result = {
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
        break;
        
      case 'prompts/get':
        const { name: promptName, arguments: promptArgs } = params;
        if (promptName === 'hello_prompt') {
          const name = promptArgs?.name || 'friend';
          result = {
            description: 'A friendly greeting prompt',
            messages: [{
              role: 'user',
              content: {
                type: 'text',
                text: `Please greet ${name} in a friendly and professional manner.`
              }
            }]
          };
        } else {
          throw new Error(`Unknown prompt: ${promptName}`);
        }
        break;
        
      case 'notifications/initialized':
        // Notification - just acknowledge
        return res.status(200).end();
        
      default:
        throw new Error(`Unknown method: ${method}`);
    }
    
    return res.json({
      jsonrpc: '2.0',
      id: id,
      result: result
    });
    
  } catch (error) {
    return res.status(500).json({
      jsonrpc: '2.0',
      id: id,
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Standard MCP SSE Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`Message endpoint: http://localhost:${PORT}/message`);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.timeout = 0;

module.exports = app;