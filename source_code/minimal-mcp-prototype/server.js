const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Constants
const PORT = process.env.PORT || 3000;
const TOOL_NAMES = {
  GET_CURRENT_PROJECTS: 'get_current_projects',
  GET_TODAYS_SCHEDULE: 'get_todays_schedule',
  GET_USER_PREFERENCES: 'get_user_preferences',
  QUERY_CONTEXT: 'query_context',
  GET_PROJECT_DETAILS: 'get_project_details'
};

const RESOURCE_URIS = {
  USER_PROFILE: 'context://user_profile',
  CURRENT_PROJECTS: 'context://current_projects',
  UPCOMING_MEETINGS: 'context://upcoming_meetings'
};

const PROMPT_NAMES = {
  DAILY_PLANNING: 'daily_planning',
  PROJECT_STATUS: 'project_status'
};

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

// Create Express app for health check
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
      version: '1.0.0'
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

// Create MCP Server
const server = new Server(
  {
    name: 'AI Context Service Prototype',
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

// Implement Tool Handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log('Tools list requested');
  return {
    tools: [
      {
        name: TOOL_NAMES.GET_CURRENT_PROJECTS,
        description: 'Retrieve list of current active projects with status and priorities',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: TOOL_NAMES.GET_TODAYS_SCHEDULE,
        description: "Get today's meetings and availability",
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: TOOL_NAMES.GET_USER_PREFERENCES,
        description: 'Access user work patterns and communication preferences',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: TOOL_NAMES.QUERY_CONTEXT,
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
        name: TOOL_NAMES.GET_PROJECT_DETAILS,
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
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    console.log(`Tool called: ${name}`, args);
    
    switch (name) {
      case TOOL_NAMES.GET_CURRENT_PROJECTS:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contextData.current_projects, null, 2)
            }
          ]
        };
        
      case TOOL_NAMES.GET_TODAYS_SCHEDULE:
        const today = getTodayDate();
        const todaysMeetings = contextData.upcoming_meetings.filter(meeting => 
          meeting.date === today
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(todaysMeetings, null, 2)
            }
          ]
        };
        
      case TOOL_NAMES.GET_USER_PREFERENCES:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contextData.preferences, null, 2)
            }
          ]
        };
        
      case TOOL_NAMES.QUERY_CONTEXT:
        if (!args.query) {
          throw new Error('Query parameter is required');
        }
        const searchResults = searchContext(args.query);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(searchResults, null, 2)
            }
          ]
        };
        
      case TOOL_NAMES.GET_PROJECT_DETAILS:
        if (!args.project_id) {
          throw new Error('Project ID parameter is required');
        }
        const project = contextData.current_projects.find(p => p.id === args.project_id);
        if (!project) {
          throw new Error(`Project with ID ${args.project_id} not found`);
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(project, null, 2)
            }
          ]
        };
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error('Tool execution error:', error);
    throw error;
  }
});

// Implement Resource Handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  console.log('Resources list requested');
  return {
    resources: [
      {
        uri: RESOURCE_URIS.USER_PROFILE,
        name: 'User Profile',
        description: "Current user's basic profile and work patterns",
        mimeType: 'application/json'
      },
      {
        uri: RESOURCE_URIS.CURRENT_PROJECTS,
        name: 'Current Projects',
        description: 'List of active projects with status and deadlines',
        mimeType: 'application/json'
      },
      {
        uri: RESOURCE_URIS.UPCOMING_MEETINGS,
        name: 'Upcoming Meetings',
        description: 'Scheduled meetings and calendar events',
        mimeType: 'application/json'
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  try {
    const { uri } = request.params;
    console.log(`Resource read requested: ${uri}`);
    
    switch (uri) {
      case RESOURCE_URIS.USER_PROFILE:
        return {
          contents: [
            {
              uri: uri,
              mimeType: 'application/json',
              text: JSON.stringify(contextData.user_profile, null, 2)
            }
          ]
        };
        
      case RESOURCE_URIS.CURRENT_PROJECTS:
        return {
          contents: [
            {
              uri: uri,
              mimeType: 'application/json',
              text: JSON.stringify(contextData.current_projects, null, 2)
            }
          ]
        };
        
      case RESOURCE_URIS.UPCOMING_MEETINGS:
        return {
          contents: [
            {
              uri: uri,
              mimeType: 'application/json',
              text: JSON.stringify(contextData.upcoming_meetings, null, 2)
            }
          ]
        };
        
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  } catch (error) {
    console.error('Resource read error:', error);
    throw error;
  }
});

// Implement Prompt Handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  console.log('Prompts list requested');
  return {
    prompts: [
      {
        name: PROMPT_NAMES.DAILY_PLANNING,
        description: 'Help plan the day based on schedule, projects, and preferences',
        arguments: []
      },
      {
        name: PROMPT_NAMES.PROJECT_STATUS,
        description: 'Summarize current project status and next actions',
        arguments: []
      }
    ]
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  try {
    const { name } = request.params;
    console.log(`Prompt requested: ${name}`);
    
    switch (name) {
      case PROMPT_NAMES.DAILY_PLANNING:
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

        return {
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
        
      case PROMPT_NAMES.PROJECT_STATUS:
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

        return {
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
        
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  } catch (error) {
    console.error('Prompt generation error:', error);
    throw error;
  }
});

// Start Express server for health checks
app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
  console.log(`Health check endpoint: http://localhost:${PORT}/health`);
});

// Start MCP server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('MCP Server connected and ready');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down servers...');
  process.exit(0);
});

// Start the MCP server
if (require.main === module) {
  main().catch(error => {
    console.error('Server startup error:', error);
    process.exit(1);
  });
}