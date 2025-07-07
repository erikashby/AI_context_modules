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

// Simple SSE endpoint that just streams capabilities
app.get('/sse', (req, res) => {
  console.log('SSE connection requested');
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send initialization message
  const initMessage = {
    jsonrpc: '2.0',
    method: 'initialized',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: { listChanged: true },
        resources: { listChanged: true },
        prompts: { listChanged: true }
      },
      serverInfo: {
        name: 'Hello World MCP Server',
        version: '1.0.0'
      }
    }
  };

  res.write(`data: ${JSON.stringify(initMessage)}\n\n`);
  console.log('Sent initialization message');

  // Send tools list
  const toolsMessage = {
    jsonrpc: '2.0',
    method: 'tools/list',
    params: {
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
    }
  };

  res.write(`data: ${JSON.stringify(toolsMessage)}\n\n`);
  console.log('Sent tools list');

  // Keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(`data: {"jsonrpc": "2.0", "method": "ping", "params": {"timestamp": ${Date.now()}}}\n\n`);
    } catch (error) {
      console.log('Connection closed during heartbeat');
      clearInterval(heartbeat);
    }
  }, 30000);

  req.on('close', () => {
    console.log('SSE connection closed by client');
    clearInterval(heartbeat);
  });

  req.on('aborted', () => {
    console.log('SSE connection aborted by client');
    clearInterval(heartbeat);
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple SSE MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.timeout = 0;

module.exports = app;