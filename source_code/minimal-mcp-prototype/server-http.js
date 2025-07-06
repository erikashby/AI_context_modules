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

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Helper function to search context data
function searchContext(query) {
  try {
    const results = [];
    const queryLower = query.toLowerCase();
    
    // Search in user profile
    const profile = contextData.user_profile;
    if (JSON.stringify(profile).toLowerCase().includes(queryLower)) {
      results.push({ type: 'user_profile', data: profile });
    }
    
    // Search in projects
    contextData.current_projects.forEach(project => {
      if (JSON.stringify(project).toLowerCase().includes(queryLower)) {
        results.push({ type: 'project', data: project });
      }
    });
    
    // Search in meetings
    contextData.upcoming_meetings.forEach(meeting => {
      if (JSON.stringify(meeting).toLowerCase().includes(queryLower)) {
        results.push({ type: 'meeting', data: meeting });
      }
    });
    
    // Search in preferences
    const preferences = contextData.preferences;
    if (JSON.stringify(preferences).toLowerCase().includes(queryLower)) {
      results.push({ type: 'preferences', data: preferences });
    }
    
    // Search in recent context
    contextData.recent_context.forEach(context => {
      if (JSON.stringify(context).toLowerCase().includes(queryLower)) {
        results.push({ type: 'recent_context', data: context });
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error searching context:', error);
    return [];
  }
}

// Health endpoint for Railway (required for deployment)
app.get('/health', (req, res) => {
  try {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'AI Context Service MCP Server',
      version: '1.0.0',
      transport: 'HTTP',
      context_loaded: !!contextData
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

// Status endpoint (alternative to health)
app.get('/status', (req, res) => {
  try {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'AI Context Service MCP Server',
      version: '1.0.0',
      transport: 'HTTP',
      context_loaded: !!contextData
    };
    console.log('Status check requested:', healthStatus);
    res.json(healthStatus);
  } catch (error) {
    console.error('Status check failed:', error);
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
    transport: 'HTTP',
    endpoints: {
      status: '/status',
      mcp: '/api/mcp'
    },
    timestamp: new Date().toISOString()
  });
});

// MCP JSON-RPC endpoint (use /api/mcp to avoid conflicts)
app.post('/api/mcp', async (req, res) => {
  try {
    const { method, params, id } = req.body;
    console.log(`MCP Request: ${method}`, params);
    
    let result;
    
    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            resources: {},
            prompts: {}
          },
          serverInfo: {
            name: 'AI Context Service Prototype',
            version: '1.0.0'
          }
        };
        break;
        
      case 'tools/list':
        result = {
          tools: [
            {
              name: 'get_current_projects',
              description: 'Retrieve list of current active projects with status and priorities',
              inputSchema: {
                type: 'object',
                properties: {},
                required: []
              }
            },
            {
              name: 'get_todays_schedule',
              description: "Get today's meetings and availability",
              inputSchema: {
                type: 'object',
                properties: {},
                required: []
              }
            },
            {
              name: 'get_user_preferences',
              description: 'Access user work patterns and communication preferences',
              inputSchema: {
                type: 'object',
                properties: {},
                required: []
              }
            },
            {
              name: 'query_context',
              description: 'Search across all context data for specific information',
              inputSchema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'Search term or question'
                  }
                },
                required: ['query']
              }
            },
            {
              name: 'get_project_details',
              description: 'Get detailed information about a specific project',
              inputSchema: {
                type: 'object',
                properties: {
                  project_id: {
                    type: 'string',
                    description: 'Project identifier'
                  }
                },
                required: ['project_id']
              }
            }
          ]
        };
        break;
        
      case 'tools/call':
        const { name, arguments: args } = params;
        
        switch (name) {
          case 'get_current_projects':
            result = {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(contextData.current_projects, null, 2)
                }
              ]
            };
            break;
            
          case 'get_todays_schedule':
            const today = getTodayDate();
            const todaysMeetings = contextData.upcoming_meetings.filter(meeting => 
              meeting.date === today
            );
            result = {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(todaysMeetings, null, 2)
                }
              ]
            };
            break;
            
          case 'get_user_preferences':
            result = {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(contextData.preferences, null, 2)
                }
              ]
            };
            break;
            
          case 'query_context':
            if (!args?.query) {
              throw new Error('Query parameter is required');
            }
            const searchResults = searchContext(args.query);
            result = {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(searchResults, null, 2)
                }
              ]
            };
            break;
            
          case 'get_project_details':
            if (!args?.project_id) {
              throw new Error('Project ID parameter is required');
            }
            const project = contextData.current_projects.find(p => p.id === args.project_id);
            if (!project) {
              throw new Error(`Project with ID ${args.project_id} not found`);
            }
            result = {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(project, null, 2)
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
              uri: 'context://user_profile',
              name: 'User Profile',
              description: "Current user's basic profile and work patterns",
              mimeType: 'application/json'
            },
            {
              uri: 'context://current_projects',
              name: 'Current Projects',
              description: 'List of active projects with status and deadlines',
              mimeType: 'application/json'
            },
            {
              uri: 'context://upcoming_meetings',
              name: 'Upcoming Meetings',
              description: 'Scheduled meetings and calendar events',
              mimeType: 'application/json'
            }
          ]
        };
        break;
        
      case 'resources/read':
        const { uri } = params;
        
        switch (uri) {
          case 'context://user_profile':
            result = {
              contents: [
                {
                  uri: uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(contextData.user_profile, null, 2)
                }
              ]
            };
            break;
            
          case 'context://current_projects':
            result = {
              contents: [
                {
                  uri: uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(contextData.current_projects, null, 2)
                }
              ]
            };
            break;
            
          case 'context://upcoming_meetings':
            result = {
              contents: [
                {
                  uri: uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(contextData.upcoming_meetings, null, 2)
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
              name: 'daily_planning',
              description: 'Help plan the day based on schedule, projects, and preferences',
              arguments: []
            },
            {
              name: 'project_status',
              description: 'Summarize current project status and next actions',
              arguments: []
            }
          ]
        };
        break;
        
      case 'prompts/get':
        const { name: promptName } = params;
        
        switch (promptName) {
          case 'daily_planning':
            const today = getTodayDate();
            const todaysMeetings = contextData.upcoming_meetings.filter(meeting => 
              meeting.date === today
            );
            
            const dailyPlanningPrompt = `Based on the user's context, help plan their day effectively:

**User Profile:**
${JSON.stringify(contextData.user_profile, null, 2)}

**Today's Schedule (${today}):**
${JSON.stringify(todaysMeetings, null, 2)}

**Current Projects:**
${JSON.stringify(contextData.current_projects, null, 2)}

**Work Preferences:**
${JSON.stringify(contextData.preferences, null, 2)}

Please provide a structured daily plan that considers:
- Peak productivity times
- Meeting schedule and preparation needed
- Project priorities and deadlines
- Work preferences and communication style
- Recommended focus blocks for deep work`;

            result = {
              description: 'Daily planning assistant with user context',
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: dailyPlanningPrompt
                  }
                }
              ]
            };
            break;
            
          case 'project_status':
            const projectStatusPrompt = `Provide a comprehensive project status summary:

**Current Active Projects:**
${JSON.stringify(contextData.current_projects, null, 2)}

**User Work Preferences:**
${JSON.stringify(contextData.preferences, null, 2)}

**Recent Context:**
${JSON.stringify(contextData.recent_context, null, 2)}

Please analyze and summarize:
- Overall project health and progress
- Critical deadlines and priorities
- Next actions required for each project
- Potential risks or blockers
- Recommendations for focus areas
- Alignment with user's work preferences`;

            result = {
              description: 'Project status summary with context analysis',
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: projectStatusPrompt
                  }
                }
              ]
            };
            break;
            
          default:
            throw new Error(`Unknown prompt: ${promptName}`);
        }
        break;
        
      default:
        throw new Error(`Unknown method: ${method}`);
    }
    
    // Send JSON-RPC response
    res.json({
      jsonrpc: '2.0',
      id: id,
      result: result
    });
    
  } catch (error) {
    console.error('MCP Error:', error);
    res.status(400).json({
      jsonrpc: '2.0',
      id: req.body.id || null,
      error: {
        code: -32602,
        message: error.message
      }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`HTTP MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Status check: http://localhost:${PORT}/status`);
  console.log(`Root endpoint: http://localhost:${PORT}/`);
  console.log(`MCP endpoint: http://localhost:${PORT}/api/mcp`);
  console.log('Server ready for HTTP MCP connections');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down HTTP MCP server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down HTTP MCP server...');
  process.exit(0);
});