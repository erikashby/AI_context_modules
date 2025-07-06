// Vercel serverless MCP server
const fs = require('fs');
const path = require('path');

// Load context data
let contextData;
try {
  const contextPath = path.join(__dirname, 'context-data.json');
  contextData = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
  console.log('Context data loaded successfully');
} catch (error) {
  console.error('Failed to load context data:', error);
  contextData = {};
}

// Helper functions
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function searchContext(query) {
  try {
    const results = [];
    const queryLower = query.toLowerCase();
    
    // Search in user profile
    const profile = contextData.user_profile;
    if (profile && JSON.stringify(profile).toLowerCase().includes(queryLower)) {
      results.push({ type: 'user_profile', data: profile });
    }
    
    // Search in projects
    if (contextData.current_projects) {
      contextData.current_projects.forEach(project => {
        if (JSON.stringify(project).toLowerCase().includes(queryLower)) {
          results.push({ type: 'project', data: project });
        }
      });
    }
    
    // Search in meetings
    if (contextData.upcoming_meetings) {
      contextData.upcoming_meetings.forEach(meeting => {
        if (JSON.stringify(meeting).toLowerCase().includes(queryLower)) {
          results.push({ type: 'meeting', data: meeting });
        }
      });
    }
    
    // Search in preferences
    const preferences = contextData.preferences;
    if (preferences && JSON.stringify(preferences).toLowerCase().includes(queryLower)) {
      results.push({ type: 'preferences', data: preferences });
    }
    
    // Search in recent context
    if (contextData.recent_context) {
      contextData.recent_context.forEach(context => {
        if (JSON.stringify(context).toLowerCase().includes(queryLower)) {
          results.push({ type: 'recent_context', data: context });
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error searching context:', error);
    return [];
  }
}

// Main handler function for Vercel
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
      const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'AI Context Service MCP Server',
        version: '1.0.0',
        transport: 'HTTP',
        context_loaded: !!contextData
      };
      return res.json(healthStatus);
    }

    // Status endpoint
    if (url === '/status' && method === 'GET') {
      const statusData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'AI Context Service MCP Server',
        version: '1.0.0',
        transport: 'HTTP',
        context_loaded: !!contextData
      };
      return res.json(statusData);
    }

    // Root endpoint
    if (url === '/' && method === 'GET') {
      return res.json({
        service: 'AI Context Service MCP Server',
        version: '1.0.0',
        transport: 'HTTP',
        endpoints: {
          health: '/health',
          status: '/status',
          mcp: '/api/mcp'
        },
        timestamp: new Date().toISOString()
      });
    }

    // MCP JSON-RPC endpoint
    if (url === '/api/mcp' && method === 'POST') {
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
                inputSchema: { type: 'object', properties: {}, required: [] }
              },
              {
                name: 'get_todays_schedule',
                description: "Get today's meetings and availability",
                inputSchema: { type: 'object', properties: {}, required: [] }
              },
              {
                name: 'get_user_preferences',
                description: 'Access user work patterns and communication preferences',
                inputSchema: { type: 'object', properties: {}, required: [] }
              },
              {
                name: 'query_context',
                description: 'Search across all context data for specific information',
                inputSchema: {
                  type: 'object',
                  properties: { query: { type: 'string', description: 'Search term or question' } },
                  required: ['query']
                }
              },
              {
                name: 'get_project_details',
                description: 'Get detailed information about a specific project',
                inputSchema: {
                  type: 'object',
                  properties: { project_id: { type: 'string', description: 'Project identifier' } },
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
                content: [{ type: 'text', text: JSON.stringify(contextData.current_projects || [], null, 2) }]
              };
              break;
              
            case 'get_todays_schedule':
              const today = getTodayDate();
              const todaysMeetings = (contextData.upcoming_meetings || []).filter(meeting => 
                meeting.date === today
              );
              result = {
                content: [{ type: 'text', text: JSON.stringify(todaysMeetings, null, 2) }]
              };
              break;
              
            case 'get_user_preferences':
              result = {
                content: [{ type: 'text', text: JSON.stringify(contextData.preferences || {}, null, 2) }]
              };
              break;
              
            case 'query_context':
              if (!args?.query) {
                throw new Error('Query parameter is required');
              }
              const searchResults = searchContext(args.query);
              result = {
                content: [{ type: 'text', text: JSON.stringify(searchResults, null, 2) }]
              };
              break;
              
            case 'get_project_details':
              if (!args?.project_id) {
                throw new Error('Project ID parameter is required');
              }
              const project = (contextData.current_projects || []).find(p => p.id === args.project_id);
              if (!project) {
                throw new Error(`Project with ID ${args.project_id} not found`);
              }
              result = {
                content: [{ type: 'text', text: JSON.stringify(project, null, 2) }]
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
                contents: [{
                  uri: uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(contextData.user_profile || {}, null, 2)
                }]
              };
              break;
              
            case 'context://current_projects':
              result = {
                contents: [{
                  uri: uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(contextData.current_projects || [], null, 2)
                }]
              };
              break;
              
            case 'context://upcoming_meetings':
              result = {
                contents: [{
                  uri: uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(contextData.upcoming_meetings || [], null, 2)
                }]
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
          
          if (promptName === 'daily_planning') {
            const today = getTodayDate();
            const todaysMeetings = (contextData.upcoming_meetings || []).filter(meeting => 
              meeting.date === today
            );
            
            result = {
              description: 'Daily planning assistant with user context',
              messages: [{
                role: 'user',
                content: {
                  type: 'text',
                  text: `Based on user context, plan the day: Projects: ${JSON.stringify(contextData.current_projects || [], null, 2)}, Meetings: ${JSON.stringify(todaysMeetings, null, 2)}, Preferences: ${JSON.stringify(contextData.preferences || {}, null, 2)}`
                }
              }]
            };
          } else if (promptName === 'project_status') {
            result = {
              description: 'Project status summary with context analysis',
              messages: [{
                role: 'user',
                content: {
                  type: 'text',
                  text: `Summarize project status: ${JSON.stringify(contextData.current_projects || [], null, 2)}`
                }
              }]
            };
          } else {
            throw new Error(`Unknown prompt: ${promptName}`);
          }
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