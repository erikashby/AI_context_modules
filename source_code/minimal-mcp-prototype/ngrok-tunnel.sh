#!/bin/bash
# Local tunnel for testing MCP server with Claude Desktop
# Install ngrok first: https://ngrok.com/

echo "Starting MCP Server locally..."
npm start &
SERVER_PID=$!

sleep 3

echo "Creating ngrok tunnel..."
ngrok http 3000 --log=stdout &
NGROK_PID=$!

echo "Server PID: $SERVER_PID"
echo "Ngrok PID: $NGROK_PID"
echo ""
echo "Use the https://xxx.ngrok.io/sse URL in Claude Desktop"
echo ""
echo "Press Ctrl+C to stop both services"

# Cleanup on exit
trap "kill $SERVER_PID $NGROK_PID 2>/dev/null" EXIT

wait