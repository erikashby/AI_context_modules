// Correct SSE MCP Server Implementation for Claude Desktop
// Based on official ModelContextProtocol examples

const sessions = new Map();
let sessionCounter = 0;

// Generate session ID
function generateSessionId() {
  return `session_${++sessionCounter}_${Date.now()}`;
}

// Create SSE stream
function createSSEStream(res, sessionId, messageEndpoint) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });

  // Send initial endpoint information
  const endpointData = `${messageEndpoint}?sessionId=${sessionId}`;
  res.write(`event: endpoint\n`);
  res.write(`data: ${endpointData}\n\n`);

  // Send server capabilities
  const capabilities = {
    jsonrpc: '2.0',
    id: null,
    result: {
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
    }
  };

  res.write(`event: message\n`);
  res.write(`data: ${JSON.stringify(capabilities)}\n\n`);

  return res;
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

// Main Vercel handler
module.exports = async (req, res) => {
  const { url, method } = req;
  console.log(`${method} ${url}`);

  try {
    // Handle CORS preflight
    if (method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }

    // Health check
    if (url === '/health' && method === 'GET') {
      return res.json({
        status: 'ok',
        service: 'Hello World MCP SSE Server',
        version: '1.0.0',
        transport: 'SSE'
      });
    }

    // Root endpoint
    if (url === '/' && method === 'GET') {
      return res.json({
        service: 'Hello World MCP SSE Server',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          sse: '/sse',
          message: '/message'
        }
      });
    }

    // SSE endpoint - establishes Server-Sent Events connection
    if (url === '/sse' && method === 'GET') {
      const sessionId = generateSessionId();
      const messageEndpoint = '/message';
      
      // Store session
      sessions.set(sessionId, {
        id: sessionId,
        connected: true,
        startTime: Date.now()
      });

      console.log(`SSE connection established: ${sessionId}`);
      
      // Create SSE stream
      const sseRes = createSSEStream(res, sessionId, messageEndpoint);
      
      // Handle client disconnect
      req.on('close', () => {
        console.log(`SSE connection closed: ${sessionId}`);
        sessions.delete(sessionId);
      });

      // Keep connection alive
      const keepAlive = setInterval(() => {
        if (sessions.has(sessionId)) {
          sseRes.write(`event: ping\ndata: ${Date.now()}\n\n`);
        } else {
          clearInterval(keepAlive);
        }
      }, 30000);

      return; // Keep connection open
    }

    // Message endpoint - handles POST messages from SSE clients
    if (url.startsWith('/message') && method === 'POST') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const sessionId = urlParams.get('sessionId');
      
      if (!sessionId || !sessions.has(sessionId)) {
        return res.status(400).json({ error: 'Invalid or missing session ID' });
      }

      const { method: rpcMethod, params, id } = req.body;
      
      try {
        const response = handleMCPRequest(rpcMethod, params, id);
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
    }

    // 404 for unknown routes
    return res.status(404).json({ error: 'Not Found', path: url });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};