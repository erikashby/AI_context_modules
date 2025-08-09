import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class McpService {
  async handleRequest(req: Request, res: Response, username: string, key: string) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] MCP request for ${username} - Method: ${req.method}`);
    console.log(`[${requestId}] Request body:`, req.body);

    try {
      // 1. Basic API key validation (placeholder)
      if (!this.validateApiKey(username, key)) {
        console.log(`[${requestId}] Authentication failed for ${username}`);
        return res.status(401).json({
          error: 'Invalid authentication credentials',
          message: 'Check your MCP endpoint URL and key'
        });
      }

      // 2. Simple debug response to test endpoint
      console.log(`[${requestId}] Authenticated MCP request for ${username}`);
      
      // For now, just return a simple response to test connectivity
      return res.json({
        message: 'MCP endpoint working',
        username: username,
        method: req.method,
        timestamp: new Date().toISOString(),
        requestId: requestId
      });

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