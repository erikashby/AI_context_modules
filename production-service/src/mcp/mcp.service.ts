import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';

@Injectable()
export class McpService {
  async handleRequest(req: Request, res: Response, username: string, key: string) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] MCP request for ${username} - Method: ${req.method}`);

    try {
      // 1. Basic API key validation (placeholder)
      if (!this.validateApiKey(username, key)) {
        console.log(`[${requestId}] Authentication failed for ${username}`);
        return res.status(401).json({
          error: 'Invalid authentication credentials',
          message: 'Check your MCP endpoint URL and key'
        });
      }

      console.log(`[${requestId}] Authenticated MCP request for ${username}`);

      // 2. Create stateless MCP server with test tool
      const server = new Server({
        name: 'AI Context Service - NestJS Test',
        version: '1.0.0',
      }, {
        capabilities: {
          tools: {}
        }
      });

      // 3. Register tools
      server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
          tools: [
            {
              name: 'ping',
              description: 'Test connectivity with the MCP server',
              inputSchema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    description: 'Optional message to include in response',
                  },
                },
              },
            },
          ],
        };
      });

      // 4. Register tool handler
      server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        
        if (name === 'ping') {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                message: 'pong',
                echo: args?.message || 'No message provided',
                timestamp: new Date().toISOString(),
                username: username,
                environment: 'production-nestjs',
                server: 'AI Context Service',
                version: '1.0.0'
              }, null, 2)
            }]
          };
        }
        
        throw new Error(`Unknown tool: ${name}`);
      });

      // 5. Handle with StreamableHTTPServerTransport (stateless)
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined // Stateless mode
      });

      // 6. Proper cleanup on request close
      res.on('close', () => {
        console.log(`[${requestId}] Request closed, cleaning up`);
        try {
          transport.close();
          server.close();
        } catch (cleanupError) {
          console.error(`[${requestId}] Cleanup error:`, cleanupError);
        }
      });

      // 7. Connect and handle request
      await server.connect(transport);
      
      if (req.method === 'POST') {
        await transport.handleRequest(req, res, req.body);
      } else {
        await transport.handleRequest(req, res);
      }

      console.log(`[${requestId}] MCP request completed successfully`);

    } catch (error) {
      console.error(`[${requestId}] MCP error:`, error);
      
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
            details: error.message
          },
          id: req.body?.id || null,
        });
      }
    }
  }

  private validateApiKey(username: string, key: string): boolean {
    // Placeholder validation - for testing only
    // In production, this would read from user profile files
    if (username === 'testuser' && key === 'testkey') {
      return true;
    }
    
    // Allow erik/demo for initial testing
    if (username === 'erik' && key === 'demo') {
      return true;
    }
    
    console.log(`Invalid credentials: ${username}/${key}`);
    return false;
  }
}