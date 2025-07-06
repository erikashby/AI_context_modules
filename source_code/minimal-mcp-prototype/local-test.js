// Local MCP Server for testing Claude Desktop connection
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const fs = require('fs');
const path = require('path');

// Load context data
let contextData;
try {
  const contextPath = path.join(__dirname, 'context-data.json');
  contextData = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
  console.error('Context data loaded successfully');
} catch (error) {
  console.error('Failed to load context data:', error);
  process.exit(1);
}

// Create MCP Server for STDIO transport
const server = new Server(
  {
    name: 'AI Context Service Local Test',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {}
    }
  }
);

// Helper functions
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function searchContext(query) {
  const results = [];
  const queryLower = query.toLowerCase();
  
  // Search across all context data
  Object.entries(contextData).forEach(([key, value]) => {
    if (JSON.stringify(value).toLowerCase().includes(queryLower)) {
      results.push({ type: key, data: value });
    }
  });
  
  return results;
}

// Import MCP schemas
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('Tools list requested');
  return {
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
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(`Tool called: ${name}`, args);
  
  switch (name) {
    case 'get_current_projects':
      return {
        content: [{ type: 'text', text: JSON.stringify(contextData.current_projects, null, 2) }]
      };
      
    case 'get_todays_schedule':
      const today = getTodayDate();
      const todaysMeetings = contextData.upcoming_meetings.filter(m => m.date === today);
      return {
        content: [{ type: 'text', text: JSON.stringify(todaysMeetings, null, 2) }]
      };
      
    case 'get_user_preferences':
      return {
        content: [{ type: 'text', text: JSON.stringify(contextData.preferences, null, 2) }]
      };
      
    case 'query_context':
      if (!args?.query) throw new Error('Query parameter is required');
      const results = searchContext(args.query);
      return {
        content: [{ type: 'text', text: JSON.stringify(results, null, 2) }]
      };
      
    case 'get_project_details':
      if (!args?.project_id) throw new Error('Project ID parameter is required');
      const project = contextData.current_projects.find(p => p.id === args.project_id);
      if (!project) throw new Error(`Project with ID ${args.project_id} not found`);
      return {
        content: [{ type: 'text', text: JSON.stringify(project, null, 2) }]
      };
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  console.error('Resources list requested');
  return {
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
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  console.error(`Resource read: ${uri}`);
  
  const resourceMap = {
    'context://user_profile': contextData.user_profile,
    'context://current_projects': contextData.current_projects,
    'context://upcoming_meetings': contextData.upcoming_meetings
  };
  
  const data = resourceMap[uri];
  if (!data) throw new Error(`Unknown resource: ${uri}`);
  
  return {
    contents: [{
      uri: uri,
      mimeType: 'application/json',
      text: JSON.stringify(data, null, 2)
    }]
  };
});

// Prompt handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  console.error('Prompts list requested');
  return {
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
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name } = request.params;
  console.error(`Prompt requested: ${name}`);
  
  // Implementation similar to the HTTP server...
  const today = getTodayDate();
  const todaysMeetings = contextData.upcoming_meetings.filter(m => m.date === today);
  
  if (name === 'daily_planning') {
    return {
      description: 'Daily planning assistant with user context',
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Plan the day based on: Projects: ${JSON.stringify(contextData.current_projects, null, 2)}, Meetings: ${JSON.stringify(todaysMeetings, null, 2)}, Preferences: ${JSON.stringify(contextData.preferences, null, 2)}`
        }
      }]
    };
  }
  
  if (name === 'project_status') {
    return {
      description: 'Project status summary',
      messages: [{
        role: 'user', 
        content: {
          type: 'text',
          text: `Summarize project status: ${JSON.stringify(contextData.current_projects, null, 2)}`
        }
      }]
    };
  }
  
  throw new Error(`Unknown prompt: ${name}`);
});

// Start MCP server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Local MCP Server connected and ready for testing');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Server startup error:', error);
  process.exit(1);
});