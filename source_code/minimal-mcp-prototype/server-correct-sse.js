const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3000;

// Session management
const sessions = new Map();
let sessionCounter = 0;

// Generate session ID
function generateSessionId() {
  return `session_${++sessionCounter}_${Date.now()}`;
}

// Handle MCP JSON-RPC requests
function handleMCPRequest(method, params, id) {
  console.log(`MCP Request: ${method}`, params);
  
  let result;
  
  switch (method) {
    case 'initialize':
      result = {
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
        const greetName = promptArgs?.name || 'friend';
        result = {
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
        throw new Error(`Unknown prompt: ${promptName}`);
      }
      break;
      
    case 'notifications/initialized':
      // Notification - no response needed
      return null;
      
    default:
      throw new Error(`Unknown method: ${method}`);
  }
  
  return {
    jsonrpc: '2.0',
    id: id,
    result: result
  };
}

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
      sse: '/sse',
      messages: '/messages'
    }
  });
});

// Correct SSE endpoint - sends endpoint info only
app.get('/sse', (req, res) => {
  const sessionId = generateSessionId();
  console.log(`SSE connection established: ${sessionId}`);
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Store session
  sessions.set(sessionId, {
    id: sessionId,
    connected: true,
    startTime: Date.now()
  });

  // Send endpoint event (this is what Claude Desktop expects)
  res.write(`event: endpoint\n`);
  res.write(`data: /messages?sessionId=${sessionId}\n\n`);
  console.log(`Sent endpoint: /messages?sessionId=${sessionId}`);

  // Keep connection alive with pings
  const heartbeat = setInterval(() => {
    if (sessions.has(sessionId)) {
      try {
        res.write(`event: ping\n`);
        res.write(`data: ${Date.now()}\n\n`);
      } catch (error) {
        console.log(`SSE connection closed: ${sessionId}`);
        sessions.delete(sessionId);
        clearInterval(heartbeat);
      }
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`SSE connection closed: ${sessionId}`);
    sessions.delete(sessionId);
    clearInterval(heartbeat);
  });

  req.on('aborted', () => {
    console.log(`SSE connection aborted: ${sessionId}`);
    sessions.delete(sessionId);
    clearInterval(heartbeat);
  });
});

// Messages endpoint - handles MCP JSON-RPC requests
app.post('/messages', (req, res) => {
  const sessionId = req.query.sessionId;
  
  // Temporarily allow test sessions for debugging
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session ID' });
  }

  const { method, params, id } = req.body;
  console.log(`Message from session ${sessionId}:`, { method, params, id });
  
  try {
    const response = handleMCPRequest(method, params, id);
    if (response) {
      return res.json(response);
    } else {
      // Notification - just acknowledge
      return res.status(200).end();
    }
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

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Correct SSE MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`Messages endpoint: http://localhost:${PORT}/messages`);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.timeout = 0;

module.exports = app;