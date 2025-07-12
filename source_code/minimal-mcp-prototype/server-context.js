// Context Navigation MCP Server using StreamableHTTPServerTransport (2025)
// Tech-Proof Implementation: Context folder navigation system
// Based on proven stateless architecture from server-stateless-BACKUP-hello-echo.js

const express = require('express');
const cors = require('cors');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');

const PORT = process.env.PORT || 3000;

// Mock Context Data Structure
const contextData = {
  "personal-organization": {
    "README.md": "# Personal Organization\n\nThis project contains daily planning, projects, and life management context.\n\n## Folder Structure\n- current-status/ - Current priorities and this week's focus\n- planning/ - Daily and weekly planning notes\n- projects/ - Active, planning, and completed projects\n- goals-and-vision/ - Long-term goals and vision",
    "current-status": {
      "README.md": "# Current Status\n\nThis folder contains your immediate priorities and current focus areas.",
      "priorities.md": "# Current Priorities (Updated: 2025-07-11)\n\n## Work Projects\n1. **Johnson Presentation** (Due: Thursday 7/17)\n   - Status: 70% complete\n   - Need: 2 hours focused time\n   - Risk: Medium - timing tight\n\n2. **Budget Planning Q3** (Due: Friday 7/18)\n   - Status: Research phase\n   - Need: Department input by Wednesday\n   - Risk: Low - on track\n\n3. **Team Onboarding** (Ongoing)\n   - Status: New hire starts Monday\n   - Need: Laptop setup, training schedule\n   - Risk: Low - prepared\n\n## Personal Commitments\n- Soccer pickup Friday 6pm (committed)\n- Dentist appointment Tuesday 2pm\n- Family dinner Sunday 5pm\n\n## Health Goals\n- Gym 3x this week (current: 2/3)\n- 8hrs sleep target (averaging 7.2hrs)\n- Meal prep Sunday",
      "this-week.md": "# This Week Focus (Week of July 6, 2025)\n\n## Weekly Theme\n**\"Execution Week\"** - Finish Johnson presentation and prepare for Q3 planning\n\n## Key Objectives\n1. Complete Johnson presentation by Wednesday\n2. Gather budget input from all departments\n3. Onboard new team member successfully\n4. Maintain health routines\n\n## Schedule Highlights\n- **Monday**: Team standup 9am, Focus block 10-12pm\n- **Tuesday**: Dentist 2pm, Budget planning 3-5pm\n- **Wednesday**: Johnson presentation review 10am\n- **Thursday**: Johnson presentation delivery 2pm\n- **Friday**: New hire onboarding, Soccer 6pm\n\n## Weekly Success Metrics\n- [ ] Johnson presentation delivered successfully\n- [ ] All department budget input collected\n- [ ] New hire has full setup and training plan\n- [ ] Hit gym 3x this week\n- [ ] Maintain 7.5+ hour sleep average",
      "decisions-pending.md": "# Decisions Pending (Updated: 2025-07-11)\n\n## Work Decisions\n\n### 1. Q3 Budget Allocation Priority\n**Context**: $50K discretionary budget for Q3\n**Options**:\n- A) New marketing campaign\n- B) Additional developer hire\n- C) Office equipment upgrade\n**Input Needed**: Team priorities survey\n**Deadline**: Friday July 18\n**Impact**: High\n\n### 2. Conference Attendance (October)\n**Context**: Two conferences same week\n**Options**:\n- A) Tech Summit (development focus)\n- B) Leadership Conference (management focus)\n**Input Needed**: Career development plan review\n**Deadline**: End of July\n**Impact**: Medium\n\n## Personal Decisions\n\n### 3. Vacation Planning August\n**Context**: Need to book summer vacation\n**Options**:\n- A) Mountain cabin retreat (relaxation)\n- B) European cities tour (adventure)\n- C) Staycation + local activities (budget-friendly)\n**Input Needed**: Family preferences\n**Deadline**: Next week\n**Impact**: Medium"
    },
    "planning": {
      "README.md": "# Planning\n\nDaily and weekly planning notes organized by year and week.",
      "2025": {
        "2025-07-06": {
          "weekly_notes_2025-07-06.md": "# Weekly Notes - Week of July 6, 2025\n\n## Week Overview\nThis is execution week - focus on delivering the Johnson presentation and advancing Q3 planning.\n\n## Weekly Priorities\n1. **Johnson Presentation** - Complete and deliver by Thursday\n2. **Budget Planning** - Collect all department input\n3. **Team Development** - Successful new hire onboarding\n\n## Energy Management\n- **Peak Focus**: Monday-Wednesday mornings\n- **Administrative**: Wednesday afternoons\n- **Creative Work**: Tuesday mornings\n- **Meetings**: Thursday-Friday\n\n## Weekly Challenges\n- Johnson presentation timing is tight\n- Coordinating with multiple departments for budget input\n- Balancing new hire support with other priorities\n\n## Weekly Wins Target\n- Successful presentation delivery\n- Complete budget preparation\n- New team member feeling welcomed and prepared",
          "daily_notes_2025-07-11.md": "# Daily Notes - Friday, July 11, 2025\n\n## Today's Priority\n**Main Focus**: Final Johnson presentation prep + New hire onboarding prep\n\n## Schedule\n- **9:00am**: Team standup\n- **9:30am**: Johnson presentation final review (90 min focus block)\n- **11:00am**: Coffee break\n- **11:15am**: New hire onboarding checklist prep\n- **12:00pm**: Lunch\n- **1:00pm**: Department budget follow-ups\n- **2:30pm**: Johnson presentation practice run\n- **3:30pm**: Admin time - email, planning\n- **4:30pm**: Week wrap-up and Monday prep\n- **6:00pm**: Soccer pickup\n\n## Key Tasks\n- [ ] Finalize Johnson presentation slides\n- [ ] Practice presentation timing (target: 25 min + 5 min Q&A)\n- [ ] Confirm all budget input received\n- [ ] Prepare new hire welcome packet\n- [ ] Set up new hire workspace\n\n## Notes\n- Johnson presentation feels 95% ready - just need final polish\n- Budget input: Marketing ✓, Engineering ✓, Sales pending\n- New hire laptop arrived and configured\n- Soccer game moved to 6:30pm\n\n## Tomorrow Prep\n- Weekend: Meal prep, gym, family time\n- Monday prep: New hire first day agenda"
        }
      }
    },
    "projects": {
      "README.md": "# Projects\n\nOrganized by status: active, planning, completed",
      "active": {
        "johnson-presentation": {
          "project-overview.md": "# Johnson Presentation Project\n\n## Project Details\n- **Client**: Johnson & Associates\n- **Deadline**: Thursday, July 17, 2025 at 2pm\n- **Duration**: 30 minutes (25 min presentation + 5 min Q&A)\n- **Audience**: 8 senior executives\n- **Objective**: Secure $2M contract renewal\n\n## Current Status (95% Complete)\n- ✅ Research and data analysis\n- ✅ Slide deck structure\n- ✅ Key messaging and storyline\n- ✅ Supporting data and charts\n- 🔄 Final slide polish (in progress)\n- ⏳ Practice and timing refinement\n- ⏳ Q&A preparation\n\n## Next Actions\n- [ ] Complete final slide edits (Friday morning)\n- [ ] Full practice run with timing (Friday afternoon)\n- [ ] Prepare for likely questions\n- [ ] Confirm presentation tech setup\n\n## Success Criteria\n- Message clarity and impact\n- Timing: exactly 25 minutes\n- Executive engagement\n- Contract renewal commitment",
          "key-messages.md": "# Johnson Presentation Key Messages\n\n## Core Value Proposition\n\"We've delivered 40% cost savings and 60% efficiency gains. Here's how we'll triple that impact in year two.\"\n\n## Three Main Points\n\n### 1. Proven Results (5 minutes)\n- $800K cost savings achieved\n- 60% process efficiency improvement\n- 95% client satisfaction rating\n- Zero security incidents\n\n### 2. Expansion Opportunity (10 minutes)\n- 3 additional departments ready for implementation\n- Projected $2.4M additional savings\n- 18-month ROI timeline\n- Competitive advantage in market\n\n### 3. Partnership Commitment (10 minutes)\n- Dedicated team expansion (+2 specialists)\n- 24/7 support commitment\n- Quarterly business reviews\n- Innovation roadmap alignment\n\n## Anticipated Questions & Responses\n**Q: What about implementation risks?**\nA: Phased approach, proven methodology, dedicated risk mitigation team\n\n**Q: Cost justification for expansion?**\nA: 18-month ROI, $2.4M savings projection, competitive analysis\n\n**Q: Team capacity concerns?**\nA: Pre-hired specialists, proven scaling model, backup resources"
        },
        "q3-budget-planning": {
          "project-overview.md": "# Q3 Budget Planning Project\n\n## Project Details\n- **Deadline**: Friday, July 18, 2025\n- **Scope**: Complete Q3 departmental budget allocation\n- **Budget**: $500K total allocation\n- **Stakeholders**: All department heads\n\n## Current Status (60% Complete)\n- ✅ Previous quarter analysis\n- ✅ Executive budget guidelines\n- ✅ Marketing department input\n- ✅ Engineering department input\n- 🔄 Sales department input (pending)\n- ⏳ Operations department input\n- ⏳ Final allocation recommendations\n- ⏳ Executive presentation prep\n\n## Allocation Framework\n- 40% Growth initiatives\n- 30% Operational improvements\n- 20% Technology investments\n- 10% Contingency reserves\n\n## Next Actions\n- [ ] Follow up with Sales (due: Monday)\n- [ ] Collect Operations input (due: Tuesday)\n- [ ] Draft allocation recommendations (due: Wednesday)\n- [ ] Prepare executive presentation (due: Thursday)"
        }
      },
      "planning": {
        "team-expansion": {
          "project-overview.md": "# Team Expansion Planning\n\n## Project Status: Planning Phase\n- **Timeline**: Q4 2025 implementation\n- **Scope**: Add 2-3 team members\n- **Budget**: $180K-270K annual\n- **Priority**: Medium\n\n## Planned Roles\n1. **Senior Developer** (Priority: High)\n   - React/Node.js expertise\n   - 5+ years experience\n   - Remote or hybrid\n\n2. **UX Designer** (Priority: Medium)\n   - Product design focus\n   - Design system experience\n   - Collaborative approach\n\n3. **DevOps Engineer** (Priority: Low)\n   - AWS/Infrastructure\n   - Automation focus\n   - Security mindset\n\n## Next Planning Steps\n- [ ] Finalize job descriptions\n- [ ] Budget approval process\n- [ ] Recruitment strategy\n- [ ] Interview panel preparation"
        }
      },
      "completed": {
        "website-redesign": {
          "project-summary.md": "# Website Redesign Project - COMPLETED\n\n## Final Results\n- **Completed**: June 30, 2025\n- **Duration**: 3 months\n- **Budget**: $45K (under budget by $5K)\n- **Team**: 4 people\n\n## Key Achievements\n- ✅ 40% improvement in page load speed\n- ✅ 25% increase in conversion rate\n- ✅ 100% mobile responsiveness\n- ✅ Accessibility compliance (WCAG 2.1)\n- ✅ SEO optimization complete\n\n## Lessons Learned\n- Early user testing prevented major revisions\n- Component-based design system saved development time\n- Regular stakeholder check-ins kept project on track\n- Performance optimization should be built-in, not added later\n\n## Client Feedback\n\"Exceeded expectations on both timeline and results. The new site feels modern and performs beautifully.\" - Client testimonial"
        }
      }
    },
    "goals-and-vision": {
      "README.md": "# Goals and Vision\n\nLong-term direction and annual objectives",
      "annual-goals.md": "# 2025 Annual Goals\n\n## Professional Goals\n\n### 1. Business Growth (Primary)\n- **Target**: 50% revenue increase\n- **Current**: 32% YTD (ahead of pace)\n- **Key initiatives**: Johnson renewal, 3 new major clients\n- **Success metric**: $3M ARR by December\n\n### 2. Team Development\n- **Target**: Build high-performing 8-person team\n- **Current**: 6 people, 2 new hires planned\n- **Key initiatives**: Leadership training, mentorship program\n- **Success metric**: 95% team satisfaction, zero turnover\n\n### 3. Personal Leadership\n- **Target**: Complete executive leadership program\n- **Current**: 40% through program\n- **Key initiatives**: Monthly coaching, 360 feedback\n- **Success metric**: Program completion + promotion readiness\n\n## Personal Goals\n\n### 4. Health & Fitness\n- **Target**: Run half marathon in October\n- **Current**: 5K comfortable, building endurance\n- **Key initiatives**: 3x/week training, nutrition plan\n- **Success metric**: Sub-2:00 half marathon time\n\n### 5. Learning & Growth\n- **Target**: Master AI/ML applications for business\n- **Current**: Completed 2 courses, building prototype\n- **Key initiatives**: Hands-on projects, conference attendance\n- **Success metric**: Deploy AI feature in production\n\n### 6. Work-Life Integration\n- **Target**: Maintain sustainable 45-hour work weeks\n- **Current**: Averaging 48 hours (slightly over)\n- **Key initiatives**: Better delegation, boundary setting\n- **Success metric**: Consistent schedule, family satisfaction\n\n## Q3 Focus Areas\n- Johnson presentation and renewal\n- Q3 budget planning and execution\n- Team expansion and onboarding\n- Half marathon training consistency",
      "quarterly-focus.md": "# Q3 2025 Quarterly Focus\n\n## Quarter Theme: \"Scale & Systemize\"\n\n## Primary Objectives\n\n### 1. Revenue Acceleration\n- **Johnson renewal**: $2M contract (July)\n- **New client acquisition**: 2 major prospects (Aug-Sep)\n- **Upsell existing clients**: 30% increase target\n- **Target**: $750K Q3 revenue\n\n### 2. Operational Excellence\n- **Process documentation**: 100% client workflows\n- **Team efficiency**: 20% productivity improvement\n- **Quality metrics**: <2% error rate\n- **Client satisfaction**: 95%+ NPS score\n\n### 3. Team Building\n- **New hire integration**: 2 team members\n- **Skills development**: Individual growth plans\n- **Culture strengthening**: Team events, recognition\n- **Leadership pipeline**: Identify future leaders\n\n## Monthly Breakdown\n\n### July 2025 - Foundation\n- Johnson presentation and renewal\n- Q3 budget finalization\n- New hire onboarding (2 people)\n- Process documentation sprint\n\n### August 2025 - Acceleration\n- New client prospect presentations\n- Team efficiency improvements\n- Product feature releases\n- Half marathon training peak\n\n### September 2025 - Optimization\n- Q3 performance review\n- Q4 planning and preparation\n- Client upsell conversations\n- Process refinement\n\n## Success Metrics\n- Revenue: $750K+ Q3\n- Team satisfaction: 95%+\n- Client retention: 100%\n- Personal goals: Half marathon ready\n\n## Potential Risks\n- Johnson renewal uncertainty\n- New hire integration challenges\n- Market competition intensifying\n- Personal time management\n\n## Mitigation Strategies\n- Johnson: Over-prepare, multiple scenarios\n- Integration: Structured onboarding, mentorship\n- Competition: Differentiation focus, client relationships\n- Time: Delegation, boundary setting, efficiency tools",
      "life-vision.md": "# Life Vision Statement\n\n## 10-Year Vision (2035)\n\n### Professional Legacy\n\"To build a sustainable, profitable business that creates meaningful value for clients while providing growth opportunities for a team of exceptional people.\"\n\n**Key Elements**:\n- **Business Impact**: $10M+ annual revenue, industry recognition\n- **Team Leadership**: 25+ person organization, leadership development focus\n- **Innovation**: Known for cutting-edge solutions and client success\n- **Sustainability**: Systems and processes that don't require constant personal oversight\n\n### Personal Fulfillment\n\"To maintain strong relationships, excellent health, and continuous learning while building something meaningful.\"\n\n**Key Elements**:\n- **Family**: Strong marriage, present parent, supportive extended family relationships\n- **Health**: Excellent physical condition, mental wellness, energy for all priorities\n- **Learning**: Continuous growth, teaching others, staying curious and relevant\n- **Community**: Contributing to local community, mentoring next generation\n\n## Core Values (Non-Negotiable)\n\n### 1. Integrity\n- Always do what we say we'll do\n- Transparent communication, even when difficult\n- Ethical business practices in all situations\n\n### 2. Excellence\n- Continuous improvement mindset\n- High standards for ourselves and our work\n- Pride in craft and attention to detail\n\n### 3. Growth\n- Personal development priority\n- Team member development investment\n- Business innovation and evolution\n\n### 4. Balance\n- Sustainable work practices\n- Family and health as foundational priorities\n- Long-term thinking over short-term gains\n\n### 5. Impact\n- Creating value for clients and community\n- Building something larger than ourselves\n- Positive influence on people and industry\n\n## Decision Framework\n\nWhen facing major decisions, evaluate against:\n1. **Values Alignment**: Does this support our core values?\n2. **Vision Contribution**: Does this move us toward our 10-year vision?\n3. **Sustainability**: Can we maintain this long-term?\n4. **Impact**: Will this create positive value for stakeholders?\n5. **Growth**: Does this challenge us to improve and learn?\n\n## Regular Review Process\n- **Annual**: Full vision and goals review\n- **Quarterly**: Progress assessment and adjustment\n- **Monthly**: Tactical alignment check\n- **Weekly**: Priority setting and focus areas\n\n## Current Phase: Foundation Building (2024-2027)\n\nFocus on establishing systems, team, and market position that will enable the next phase of growth while maintaining personal well-being and family priorities."
    }
  }
};

// Function to create fresh server instance for each request
function createServer() {
  const server = new Server(
    {
      name: 'AI Context Service - Tech Proof',
      version: '2.0.0',
    },
    {
      capabilities: {
        tools: { listChanged: true },
        resources: { subscribe: true, listChanged: true },
        prompts: { listChanged: true }
      },
    }
  );

  // Register tool handlers - 4 Context Navigation Tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'list_projects',
          description: 'Show available context projects to AI assistant',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'explore_project',
          description: 'Get folder structure overview of a specific project',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { 
                type: 'string', 
                description: 'Project identifier (e.g., personal-organization)' 
              }
            },
            required: ['project_id']
          }
        },
        {
          name: 'list_folder_contents',
          description: 'Show files/folders in a specific project path',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { 
                type: 'string', 
                description: 'Project identifier' 
              },
              folder_path: { 
                type: 'string', 
                description: 'Folder path within project (e.g., current-status)' 
              }
            },
            required: ['project_id', 'folder_path']
          }
        },
        {
          name: 'read_file',
          description: 'Read specific context files',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { 
                type: 'string', 
                description: 'Project identifier' 
              },
              file_path: { 
                type: 'string', 
                description: 'File path within project (e.g., current-status/priorities.md)' 
              }
            },
            required: ['project_id', 'file_path']
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      switch (name) {
        case 'list_projects':
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                projects: [
                  {
                    id: "personal-organization",
                    name: "Personal Organization",
                    description: "Daily planning, projects, and life management",
                    status: "implemented"
                  },
                  {
                    id: "personal-health",
                    name: "Personal Health",
                    description: "Fitness, nutrition, and wellness tracking",
                    status: "not_implemented"
                  }
                ]
              }, null, 2)
            }]
          };

        case 'explore_project':
          if (!args?.project_id) throw new Error('project_id parameter is required');
          
          if (args.project_id === 'personal-health') {
            return {
              content: [{
                type: 'text',
                text: 'Project "personal-health" is not implemented yet. Currently only "personal-organization" is available for the tech proof.'
              }]
            };
          }
          
          if (args.project_id !== 'personal-organization') {
            throw new Error(`Unknown project: ${args.project_id}`);
          }

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                project_id: "personal-organization",
                structure: {
                  "current-status/": ["README.md", "priorities.md", "this-week.md", "decisions-pending.md"],
                  "planning/2025/2025-07-06/": ["weekly_notes_2025-07-06.md", "daily_notes_2025-07-11.md"],
                  "projects/": ["README.md", "active/", "planning/", "completed/"],
                  "goals-and-vision/": ["README.md", "annual-goals.md", "quarterly-focus.md", "life-vision.md"]
                }
              }, null, 2)
            }]
          };

        case 'list_folder_contents':
          if (!args?.project_id || !args?.folder_path) {
            throw new Error('project_id and folder_path parameters are required');
          }
          
          if (args.project_id !== 'personal-organization') {
            throw new Error(`Unknown project: ${args.project_id}`);
          }

          const folderPath = args.folder_path.replace(/^\/+|\/+$/g, ''); // Trim slashes
          const pathParts = folderPath.split('/');
          
          let currentData = contextData['personal-organization'];
          for (const part of pathParts) {
            if (currentData && typeof currentData === 'object' && part in currentData) {
              currentData = currentData[part];
            } else {
              throw new Error(`Folder not found: ${folderPath}`);
            }
          }

          if (typeof currentData !== 'object') {
            throw new Error(`Path is not a folder: ${folderPath}`);
          }

          const contents = Object.keys(currentData).map(name => ({
            name: name,
            type: typeof currentData[name] === 'string' ? 'file' : 'folder',
            description: name === 'README.md' ? 'Folder overview and navigation guide' : 
                        name.endsWith('.md') ? 'Context file' : 'Subfolder'
          }));

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                project_id: args.project_id,
                folder_path: folderPath,
                contents: contents
              }, null, 2)
            }]
          };

        case 'read_file':
          if (!args?.project_id || !args?.file_path) {
            throw new Error('project_id and file_path parameters are required');
          }
          
          if (args.project_id !== 'personal-organization') {
            throw new Error(`Unknown project: ${args.project_id}`);
          }

          const filePath = args.file_path.replace(/^\/+|\/+$/g, ''); // Trim slashes
          const filePathParts = filePath.split('/');
          
          let fileData = contextData['personal-organization'];
          for (const part of filePathParts) {
            if (fileData && typeof fileData === 'object' && part in fileData) {
              fileData = fileData[part];
            } else {
              throw new Error(`File not found: ${filePath}`);
            }
          }

          if (typeof fileData !== 'string') {
            throw new Error(`Path is not a file: ${filePath}`);
          }

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                project_id: args.project_id,
                file_path: filePath,
                content: fileData,
                last_updated: "2025-07-11",
                file_size: `${(fileData.length / 1024).toFixed(1)}KB`
              }, null, 2)
            }]
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }]
      };
    }
  });

  // Register resource handlers (simplified for tech proof)
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'context://personal-organization',
          name: 'Personal Organization Project',
          description: 'Complete personal organization context data',
          mimeType: 'application/json'
        }
      ]
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    
    if (uri === 'context://personal-organization') {
      return {
        contents: [{
          uri: uri,
          mimeType: 'application/json',
          text: JSON.stringify(contextData['personal-organization'], null, 2)
        }]
      };
    } else {
      throw new Error(`Unknown resource: ${uri}`);
    }
  });

  // Register prompt handlers (simplified for tech proof)
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [{
        name: 'daily_planning',
        description: 'Help plan the day based on current context',
        arguments: [{
          name: 'focus_area',
          description: 'Optional focus area for planning',
          required: false
        }]
      }]
    };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: promptArgs } = request.params;
    
    if (name === 'daily_planning') {
      const focusArea = promptArgs?.focus_area || 'general';
      return {
        description: 'Daily planning prompt with context',
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Please help me plan my day. Start by exploring my current priorities, this week's focus, and today's specific context using the available context navigation tools. Focus area: ${focusArea}`
          }
        }]
      };
    } else {
      throw new Error(`Unknown prompt: ${name}`);
    }
  });

  return server;
}

// Create Express app (preserve existing architecture)
const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Context Service - Tech Proof',
    version: '2.0.0',
    transport: 'StreamableHTTP-Stateless',
    features: ['context_navigation', 'project_exploration', 'file_reading']
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AI Context Service - Tech Proof',
    version: '2.0.0',
    transport: 'StreamableHTTP-Stateless',
    endpoints: {
      health: '/health',
      mcp: '/mcp'
    },
    tools: ['list_projects', 'explore_project', 'list_folder_contents', 'read_file']
  });
});

// Stateless MCP endpoint - PRESERVE PROVEN ARCHITECTURE
app.all('/mcp', async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  
  try {
    // Create fresh server instance for this request
    const server = createServer();
    
    // Create stateless transport (sessionIdGenerator: undefined)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined // Stateless mode - CRITICAL SUCCESS FACTOR
    });

    // Handle cleanup on request close
    res.on('close', () => {
      console.log('Request closed - cleaning up');
      transport.close();
      server.close();
    });

    // Connect server to transport
    await server.connect(transport);
    console.log('Fresh server/transport created and connected');
    
    // Handle the request
    if (req.method === 'POST') {
      await transport.handleRequest(req, res, req.body);
    } else {
      await transport.handleRequest(req, res);
    }
    console.log('Request handled by stateless transport');
    
  } catch (error) {
    console.error('Stateless MCP error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// Start server
const httpServer = app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI Context Service Tech Proof running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});

httpServer.keepAliveTimeout = 65000;
httpServer.headersTimeout = 66000;
httpServer.timeout = 0;

module.exports = app;