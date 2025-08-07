# AI Developer Implementation Prompt

## Your Role
You are an **AI Developer** tasked with implementing a minimal MCP (Model Context Protocol) server prototype. An **Engineering Manager** has provided detailed specifications and will review your work. Follow the specifications exactly and ask questions if anything is unclear.

## Working Directory and Project Context

### Current Working Directory
```
/home/erikashby/Documents/Github/AI_context_service_private/
```

### Project Repository Structure
```
AI_context_service_private/
├── ai_instructions/                          # AI working guidelines
├── company_documentation/                    # Business strategy and context
├── product_and_engineering_documentation/    # Technical specifications
│   └── phase-1-foundation/                  # Phase 1 technical documents
│       ├── phase-1-tech-investigation.md     # Our MCP research findings
│       ├── minimal-tech-prototype.md         # Prototype overview plan
│       ├── phase-1-technical-architecture.md # Complete technical architecture
│       ├── development-plan-minimal-prototype.md # DETAILED SPECS (READ FIRST)
│       ├── ai-developer-prompt.md           # This document
│       └── manual-uat-checklist.md          # Testing procedures
└── source_code/                             # Implementation directory
    ├── README.md                            # Existing source code overview
    └── minimal-mcp-prototype/               # YOUR IMPLEMENTATION TARGET
        # You will create all files in this directory
```

### Required Reading Before Implementation

**CRITICAL - READ THESE DOCUMENTS IN ORDER:**

1. **`development-plan-minimal-prototype.md`** (MOST IMPORTANT)
   - Complete technical specifications
   - Exact file structure requirements
   - All 5 tools, 3 resources, 2 prompts detailed specifications
   - Mock data schema (exact JSON required)
   - Quality standards and acceptance criteria

2. **`phase-1-technical-architecture.md`**
   - Complete technical architecture decisions
   - MCP protocol details and research findings
   - Railway hosting architecture and reasoning
   - Implementation patterns and best practices

3. **`phase-1-tech-investigation.md`**
   - Research findings on MCP specification status
   - Remote MCP server capabilities analysis
   - Authentication and transport layer decisions

4. **`minimal-tech-prototype.md`**
   - High-level prototype objectives and success criteria
   - Context for why this prototype matters to the business

### Implementation Target Directory
You will create your implementation in:
```
/home/erikashby/Documents/Github/AI_context_service_private/source_code/minimal-mcp-prototype/
```

**This directory does not exist yet - you will create it and all files within it.**

## Project Context

### Business Objective
We are building **AI Context Service (ConaaS)** - a service that provides persistent, structured context to AI assistants like Claude and ChatGPT. Instead of users re-explaining their projects, schedule, and preferences every conversation, AI assistants can instantly access relevant context through our MCP server.

**Core Business Question**: Can we build a reliable remote MCP server that AI assistants can connect to over the internet?

### Why This Prototype Matters
- **Technical Validation**: Prove remote MCP servers work with Claude Desktop and ChatGPT
- **Business Validation**: Demonstrate that context significantly improves AI helpfulness
- **Risk Mitigation**: Test connection reliability before building production architecture
- **Foundation**: This prototype informs our full MVP development approach

### Research Summary
Our investigation found:
- ✅ MCP 2025-06-18 is production-ready with major enterprise adoption
- ✅ Both Claude Desktop and ChatGPT support remote MCP servers
- ✅ 5,000+ MCP servers exist with 6.6M+ monthly downloads
- ⚠️ Protocol still evolving with breaking changes every 3-6 months
- ⚠️ OAuth 2.1 authentication adds complexity (skipped for prototype)

## Technical Architecture Context

### MCP Protocol Overview
**MCP (Model Context Protocol)** is Anthropic's open standard for connecting AI assistants to external data sources. Think of it as "USB-C for AI applications."

**Architecture**:
```
AI Assistant (Claude/ChatGPT) ←→ MCP Client ←→ MCP Server (Your Code) ←→ Context Data
```

**Core Primitives**:
- **Resources**: Static context data (user profile, projects, meetings)
- **Tools**: Executable functions (query context, get schedule, etc.)
- **Prompts**: Template instructions that include context

### Protocol Specifications
- **Base Protocol**: JSON-RPC 2.0 over HTTP
- **Transport**: Streamable HTTP (preferred) or HTTP+SSE (legacy)
- **Message Format**: Structured JSON with specific MCP schemas
- **Authentication**: None for this prototype (OAuth 2.1 for production)

## Essential Documentation & Examples

### Official MCP Documentation
**Start Here**: https://modelcontextprotocol.io/
- **Getting Started**: https://modelcontextprotocol.io/introduction
- **Full Specification**: https://modelcontextprotocol.io/specification
- **SDK Documentation**: https://github.com/modelcontextprotocol/typescript-sdk

### Key Implementation Guides
**MCP Server Tutorial**: https://modelcontextprotocol.io/tutorials/building-a-server
**Examples Repository**: https://github.com/modelcontextprotocol/servers
**Express.js MCP Example**: Search GitHub for "mcp server express" for real implementations

### Critical Code References
Look for these patterns in existing MCP servers:
```javascript
// MCP Server initialization
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Tool implementation pattern
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [/* your tools */]
}));

// Resource implementation pattern  
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [/* your resources */]
}));
```

### Railway Deployment Examples
**Node.js on Railway**: https://railway.com/deploy/nodejs
**Express Deployment**: Search "deploy express app railway" for step-by-step guides

## Implementation Requirements

### Detailed Specifications
**READ THIS DOCUMENT FIRST**: `development-plan-minimal-prototype.md` in the same folder.

**Key Requirements Summary**:
- **5 Required Tools**: get_current_projects, get_todays_schedule, get_user_preferences, query_context, get_project_details
- **3 Required Resources**: user_profile, current_projects, upcoming_meetings  
- **2 Required Prompts**: daily_planning, project_status
- **Mock Data**: Exact JSON schema provided in development plan
- **Framework**: Node.js + Express.js + @modelcontextprotocol/sdk
- **Deployment**: Railway with health check endpoint

### File Structure You Must Create
```
source_code/minimal-mcp-prototype/
├── package.json                 # Dependencies (exact versions specified)
├── server.js                    # Main MCP server implementation
├── context-data.json           # Mock context data (exact schema required)
├── mcp-config.json             # MCP server configuration
├── README.md                   # Setup and deployment instructions
├── .gitignore                  # Git ignore rules
└── railway.json               # Railway deployment configuration
```

### Success Criteria
**Your implementation succeeds when**:
1. ✅ Server starts locally without errors
2. ✅ All 5 tools return correct mock data
3. ✅ All 3 resources are accessible via MCP protocol
4. ✅ All 2 prompts are available and properly formatted
5. ✅ Health check endpoint responds correctly
6. ✅ Railway deployment succeeds
7. ✅ Remote server is accessible via HTTPS
8. ✅ Engineering Manager review passes

## Architecture Details

### Hosting Environment
**Platform**: Railway (https://railway.com)
**Why Railway**: Persistent containers support both HTTP+SSE and Streamable HTTP transports
**Cost**: 30-day free trial ($5 credits) sufficient for prototype validation

**Railway Features You'll Use**:
- Automatic Node.js detection from package.json
- Environment variable PORT for dynamic port assignment
- Built-in HTTPS and domain (your-app.railway.app)
- Git-based deployment (push to deploy)
- Health check monitoring

### Transport Layer Details
**Prioritize Streamable HTTP** because:
- Better for serverless/cloud deployment
- No persistent connection requirements
- Easier debugging and monitoring
- Future-proof (MCP is moving this direction)

**Fallback to HTTP+SSE** only if Streamable HTTP doesn't work with your chosen SDK version.

### Mock Data Strategy
The mock data simulates a real user (Erik) working on the AI Context Service project:
- **Realistic Projects**: AI Context Service MVP, completed market research
- **Real Schedule**: Product planning, technical reviews
- **Authentic Preferences**: Morning productivity, direct communication style
- **Current Context**: Recent progress on MCP prototype development

This creates a believable scenario for AI assistants to demonstrate context understanding.

## Implementation Approach

### Step 1: Local Development
1. **Setup Project**: Create directory structure and package.json
2. **Install Dependencies**: @modelcontextprotocol/sdk, express, cors
3. **Create Mock Data**: Use exact JSON schema from development plan
4. **Implement MCP Server**: Tools, resources, prompts with proper error handling
5. **Add Health Check**: Express endpoint for Railway monitoring
6. **Test Locally**: Verify all MCP capabilities work

### Step 2: Railway Deployment
1. **Configure Railway**: Create railway.json with deployment settings
2. **Environment Setup**: Handle PORT variable and production settings
3. **Deploy**: Push to Railway and verify deployment success
4. **Test Remote**: Verify HTTPS endpoint and MCP protocol over internet

### Step 3: Documentation
1. **README**: Clear setup instructions for local development
2. **Deployment Guide**: How to deploy to Railway
3. **API Documentation**: Available tools, resources, and prompts
4. **Testing Instructions**: How to verify MCP functionality

## Quality Standards

### Code Quality Requirements
- **Error Handling**: All async operations in try/catch blocks
- **Input Validation**: Validate all tool parameters
- **Logging**: Console.log all MCP requests and responses for debugging
- **Comments**: Document complex logic and MCP handler purposes
- **Constants**: No hardcoded strings - use constants for tool names, etc.

### Performance Requirements
- **Startup Time**: Server must start within 10 seconds
- **Response Time**: All tool responses under 1 second
- **Memory Usage**: Stay under 100MB
- **Error Rate**: Zero unhandled exceptions

### MCP Protocol Compliance
- **JSON-RPC 2.0**: Proper request/response format
- **Error Codes**: Standard MCP error codes for invalid requests
- **Capability Advertisement**: Correctly advertise available tools/resources/prompts
- **Schema Validation**: Follow MCP schemas exactly

## Common Pitfalls to Avoid

### MCP Protocol Issues
- **Don't** implement custom authentication (skip for prototype)
- **Don't** use HTTP+SSE unless Streamable HTTP fails
- **Don't** hardcode URLs or ports (use environment variables)
- **Don't** return invalid JSON-RPC format
- **Do** follow exact MCP schemas for tools/resources/prompts

### Railway Deployment Issues
- **Don't** hardcode port 3000 (use process.env.PORT)
- **Don't** forget health check endpoint
- **Don't** skip railway.json configuration
- **Do** handle production environment variables
- **Do** include proper start script in package.json

### Data Format Issues
- **Don't** modify the mock data schema (use exactly as specified)
- **Don't** return undefined or null values
- **Don't** use inconsistent date formats
- **Do** validate data structure matches requirements
- **Do** handle missing data gracefully

## Engineering Manager Oversight

**Your work will be reviewed for**:
- Compliance with exact specifications
- Code quality and error handling
- MCP protocol correctness
- Railway deployment success
- Performance and reliability

**Questions or Issues**:
Ask the Engineering Manager immediately if:
- Specifications are unclear or contradictory
- You encounter MCP SDK documentation gaps
- Railway deployment fails
- Performance targets cannot be met
- Any technical blockers arise

## Getting Started Checklist

Before you begin coding:
- [ ] Read the complete `development-plan-minimal-prototype.md`
- [ ] Review MCP documentation at modelcontextprotocol.io
- [ ] Look at existing MCP server examples on GitHub
- [ ] Understand Railway deployment process
- [ ] Clarify any unclear requirements with Engineering Manager

**Start with**: Creating the basic project structure and package.json, then implement one tool at a time to verify your MCP integration works correctly.

## Success Metrics

**You've succeeded when**:
1. **Engineering Manager approves** your implementation
2. **Railway deployment works** and server is accessible via HTTPS
3. **All UATs pass** (manual testing by product team)
4. **AI assistants can connect** and retrieve context successfully
5. **Performance targets met** (response times, memory usage)

Remember: This is a **prototype for validation**, not a production system. Focus on proving the core technical concept while following specifications exactly.

---

**Ready to start? Create the project structure and begin with the basic MCP server setup. Ask questions early and often!**