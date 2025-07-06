const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Constants
const PORT = process.env.PORT || 3000;

// Load context data
let contextData;
try {
  const contextPath = path.join(__dirname, 'context-data.json');
  contextData = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
  console.log('Context data loaded successfully');
} catch (error) {
  console.error('Failed to load context data:', error);
  process.exit(1);
}

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  try {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'AI Context Service MCP Server',
      version: '1.0.0',
      context_loaded: !!contextData,
      port: PORT
    };
    console.log('Health check requested:', healthStatus);
    res.json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AI Context Service MCP Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      context: '/api/context',
      projects: '/api/projects',
      schedule: '/api/schedule'
    }
  });
});

// API endpoints for testing
app.get('/api/context', (req, res) => {
  res.json(contextData);
});

app.get('/api/projects', (req, res) => {
  res.json(contextData.current_projects);
});

app.get('/api/schedule', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todaysMeetings = contextData.upcoming_meetings.filter(meeting => 
    meeting.date === today
  );
  res.json(todaysMeetings);
});

// Keep-alive endpoint to prevent Railway from sleeping
app.get('/ping', (req, res) => {
  res.json({ pong: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Service info: http://localhost:${PORT}/`);
  console.log('Server ready for Railway deployment');
});

// Keep server alive
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

module.exports = app;