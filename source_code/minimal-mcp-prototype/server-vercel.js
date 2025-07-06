// Minimal Hello World MCP Server for HTTP
// Based on official MCP examples and working patterns

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { url, method } = req;
    console.log(`${method} ${url}`);

    // Health endpoint
    if (url === '/health' && method === 'GET') {
      return res.json({
        status: 'ok',
        service: 'Hello World MCP Server',
        version: '1.0.0'
      });
    }

    // Root endpoint
    if (url === '/' && method === 'GET') {
      return res.json({
        service: 'Hello World MCP Server',
        version: '1.0.2',
        endpoints: {
          health: '/health',
          mcp: '/mcp',
          sse: '/sse'
        }
      });
    }

    // MCP endpoints - both /sse and /mcp should work
    if ((url === '/sse' || url === '/mcp') && method === 'POST') {
      const { method: rpcMethod, params, id } = req.body;
      console.log(`MCP Request: ${rpcMethod}`, params);
      
      let result;
      
      switch (rpcMethod) {
        case 'initialize':
          result = {
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
              version: '1.0.1'
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
                    name: {
                      type: 'string',
                      description: 'Name to greet'
                    }
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
                    message: {
                      type: 'string',
                      description: 'Message to echo'
                    }
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
              if (!args?.name) {
                throw new Error('Name parameter is required');
              }
              result = {
                content: [
                  {
                    type: 'text',
                    text: `Hello, ${args.name}! Nice to meet you.`
                  }
                ]
              };
              break;
              
            case 'echo':
              if (!args?.message) {
                throw new Error('Message parameter is required');
              }
              result = {
                content: [
                  {
                    type: 'text',
                    text: `Echo: ${args.message}`
                  }
                ]
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
              },
              {
                uri: 'hello://info',
                name: 'Server Info',
                description: 'Information about this MCP server',
                mimeType: 'application/json'
              }
            ]
          };
          break;
          
        case 'resources/read':
          const { uri } = params;
          
          switch (uri) {
            case 'hello://world':
              result = {
                contents: [
                  {
                    uri: uri,
                    mimeType: 'text/plain',
                    text: 'Hello, World! This is a simple MCP resource.'
                  }
                ]
              };
              break;
              
            case 'hello://info':
              result = {
                contents: [
                  {
                    uri: uri,
                    mimeType: 'application/json',
                    text: JSON.stringify({
                      server: 'Hello World MCP Server',
                      version: '1.0.0',
                      capabilities: ['tools', 'resources', 'prompts'],
                      description: 'A minimal MCP server for testing'
                    }, null, 2)
                  }
                ]
              };
              break;
              
            default:
              throw new Error(`Unknown resource: ${uri}`);
          }
          break;
          
        case 'prompts/list':
          result = {
            prompts: [
              {
                name: 'hello_prompt',
                description: 'A friendly greeting prompt',
                arguments: [
                  {
                    name: 'name',
                    description: 'Name of the person to greet',
                    required: true
                  }
                ]
              }
            ]
          };
          break;
          
        case 'prompts/get':
          const { name: promptName, arguments: promptArgs } = params;
          
          if (promptName === 'hello_prompt') {
            const name = promptArgs?.name || 'friend';
            result = {
              description: 'A friendly greeting prompt',
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: `Please greet ${name} in a friendly and professional manner.`
                  }
                }
              ]
            };
          } else {
            throw new Error(`Unknown prompt: ${promptName}`);
          }
          break;
          
        case 'notifications/initialized':
          // This is a notification, not a request, so no response needed
          console.log('Client has initialized');
          return res.json({
            jsonrpc: '2.0',
            id: id
          });
          
        case 'ping':
          result = {
            acknowledged: true
          };
          break;
          
        default:
          throw new Error(`Unknown method: ${rpcMethod}`);
      }
      
      // Send JSON-RPC response
      return res.json({
        jsonrpc: '2.0',
        id: id,
        result: result
      });
    }

    // 404 for unknown routes
    return res.status(404).json({ error: 'Not Found', path: url });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
};