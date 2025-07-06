#!/usr/bin/env node

const https = require('https');
const http = require('http');

// MCP client that bridges Claude Desktop to our HTTP server
class MCPHttpClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.messageId = 0;
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        jsonrpc: '2.0',
        id: ++this.messageId,
        method: method,
        params: params
      });

      const url = new URL(this.serverUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result);
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  async processStdio() {
    // Read from stdin and forward to HTTP server
    process.stdin.setEncoding('utf8');
    
    let inputBuffer = '';
    
    process.stdin.on('data', async (chunk) => {
      inputBuffer += chunk;
      
      // Process complete JSON-RPC messages
      let lines = inputBuffer.split('\n');
      inputBuffer = lines.pop(); // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            const response = await this.sendRequest(message.method, message.params);
            
            // Send response back to Claude Desktop
            const jsonrpcResponse = {
              jsonrpc: '2.0',
              id: message.id,
              result: response
            };
            
            console.log(JSON.stringify(jsonrpcResponse));
          } catch (error) {
            // Send error response
            const errorResponse = {
              jsonrpc: '2.0',
              id: message?.id || null,
              error: {
                code: -32603,
                message: error.message
              }
            };
            
            console.log(JSON.stringify(errorResponse));
          }
        }
      }
    });

    process.stdin.on('end', () => {
      process.exit(0);
    });
  }
}

// Main execution
const serverUrl = process.env.MCP_SERVER_URL || 'https://ai_context_service_private.railway.app/api/mcp';
const client = new MCPHttpClient(serverUrl);

// Start processing stdio
client.processStdio().catch(error => {
  console.error('MCP Client Error:', error);
  process.exit(1);
});