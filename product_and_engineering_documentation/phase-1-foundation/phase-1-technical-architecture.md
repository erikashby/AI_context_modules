# Phase 1 Technical Architecture

## Overview
This document captures the complete technical architecture decisions and investigation findings for the AI Context Service (ConaaS) Phase 1 implementation, specifically focusing on the Model Context Protocol (MCP) remote server approach.

## MCP Technology Foundation

### Protocol Specifications
- **Current Version**: MCP 2025-06-18 (latest stable release)
- **Protocol Base**: JSON-RPC 2.0 with client-server architecture
- **Official Documentation**: https://modelcontextprotocol.io/
- **Formal Specification**: https://modelcontextprotocol.io/specification
- **GitHub Repository**: https://github.com/modelcontextprotocol

### MCP Architecture Components
```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   MCP Host      │    │  MCP Client  │    │   MCP Server    │
│ (Claude Desktop)│◄──►│ (Protocol    │◄──►│ (Our Context    │
│ (ChatGPT)       │    │  Connector)  │    │  Service)       │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

**Core Primitives:**
- **Resources**: Context and data (user profile, meetings, projects)
- **Tools**: Executable functions (context queries, data retrieval)
- **Prompts**: Templated messages and workflows

### Transport Layer
**Current Transition Period** (Both supported):
- **HTTP+SSE (Legacy)**: Requires persistent connections, limits serverless scaling
- **Streamable HTTP (Recommended)**: Stateless, better for cloud deployment

**Message Format**: JSON-RPC 2.0 with structured tool outputs

## Hosting Architecture

### Platform Selection: Railway
**Decision Rationale:**
- Persistent container instances (supports both transport types)
- Simple git-based deployment
- Built-in HTTPS and domains
- Good for prototype and early production

**Deployment Status**: ✅ **DEPLOYED**
- **Production URL**: https://ai_context_service_private.railway.app
- **Status**: Successfully deployed and operational
- **Health Check**: Responding correctly on `/health` endpoint

**Cost Structure:**
- **Free Trial**: 30 days with $5 credits (perfect for prototype)
- **Production**: $20/month minimum (Pro plan)
- **Expected Usage**: ~$8-10/month (512MB RAM, 0.1 vCPU)

**Railway Configuration:**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildPath": "/source_code/minimal-mcp-prototype"
  }
}
```

### Deployment Architecture
```
Internet
    │
    ▼
┌─────────────────────────────────────┐
│         Railway Cloud              │
│  ┌─────────────────────────────┐   │
│  │     Linux Container         │   │
│  │  ┌─────────────────────┐   │   │
│  │  │   Node.js Runtime   │   │   │
│  │  │  ┌─────────────┐   │   │   │
│  │  │  │ MCP Server  │   │   │   │
│  │  │  │ Application │   │   │   │
│  │  │  └─────────────┘   │   │   │
│  │  └─────────────────────┘   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
    │
    ▼ HTTPS (JSON-RPC 2.0)
┌─────────────────┐    ┌─────────────────┐
│  Claude Desktop │    │    ChatGPT      │
│     (MCP        │    │   (MCP Client)  │
│    Client)      │    │                 │
└─────────────────┘    └─────────────────┘
```

## AI Assistant Integration

### Claude Desktop Integration
**Status**: ✅ Native MCP support since launch
**Setup Process**:
1. Install Claude Desktop application
2. Configure MCP server connection in settings
3. Add remote server URL and authentication
4. Test connection and context retrieval

**Configuration Example**:
```json
{
  "mcpServers": {
    "ai-context-service": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-remote"],
      "env": {
        "MCP_SERVER_URL": "https://ai_context_service_private.railway.app"
      }
    }
  }
}
```

### ChatGPT Integration
**Status**: ✅ Confirmed support since March 2025
**Setup Process**: (To be documented during prototype testing)
- MCP plugin or configuration interface
- Remote server URL configuration
- Authentication setup

### Authentication Architecture (Future)
**Current Prototype**: No authentication (simplified validation)
**Production Plan**:
- **OAuth 2.1 + PKCE**: Required by MCP 2025-06-18 spec
- **External Provider**: Google Accounts (as specified by product)
- **Resource Server Pattern**: MCP server as OAuth Resource Server
- **Discovery Endpoints**: `/.well-known/oauth-protected-resource`

## Repository Structure

### Current Organization
```
AI_context_service_private/
├── ai_instructions/                          # AI working guidelines
├── company_documentation/                    # Business strategy
├── product_and_engineering_documentation/    # Technical specs
│   └── phase-1-foundation/
│       ├── phase-1-tech-investigation.md     # Research findings
│       ├── minimal-tech-prototype.md         # Prototype plan
│       └── phase-1-technical-architecture.md # This document
└── source_code/                             # Implementation
    ├── README.md
    └── minimal-mcp-prototype/               # NEW - Prototype implementation
        ├── package.json                     # Node.js dependencies
        ├── server.js                        # Main MCP server
        ├── mcp-config.json                  # MCP configuration
        ├── context-data.json               # Mock context data
        ├── README.md                        # Setup instructions
        └── .gitignore                       # Git ignore rules
```

## Technical Implementation Stack

### Server Technology
- **Runtime**: Node.js 18+
- **Framework**: Express.js for HTTP handling
- **MCP SDK**: Official @modelcontextprotocol/sdk-server
- **Transport**: Prioritize Streamable HTTP, fallback to HTTP+SSE

### Mock Context Schema
```json
{
  "user_profile": {
    "name": "Test User",
    "timezone": "America/New_York",
    "work_schedule": "9am-5pm weekdays",
    "productivity_peak": "morning"
  },
  "current_projects": [
    {
      "id": "proj-1",
      "name": "AI Context Service MVP",
      "status": "in_progress",
      "deadline": "2025-08-15",
      "priority": "high",
      "description": "Building MCP-based context service"
    }
  ],
  "upcoming_meetings": [
    {
      "id": "meeting-1", 
      "title": "Product Planning",
      "date": "2025-07-06",
      "time": "10:00 AM",
      "duration": "60 minutes",
      "participants": ["Erik", "Product Team"]
    }
  ],
  "preferences": {
    "communication_style": "direct",
    "work_focus": "deep_work_blocks",
    "meeting_preference": "morning_blocks"
  }
}
```

### MCP Server Implementation
**Core Components**:
1. **Server Initialization**: MCP server setup and transport configuration
2. **Resource Handlers**: Expose user context data
3. **Tool Handlers**: Implement context query functions
4. **Prompt Templates**: Context-aware prompt generation
5. **Logging & Monitoring**: Basic request/response logging

**Sample Tools**:
- `get_current_projects`: Retrieve active project list
- `get_todays_schedule`: Fetch today's meetings and availability
- `get_user_preferences`: Access user work patterns and preferences
- `query_context`: Flexible context search and retrieval

## Performance Requirements

### Target Metrics
- **Response Latency**: < 2 seconds (prototype), < 200ms (production)
- **Connection Reliability**: 99.9% uptime
- **Concurrent Connections**: Support multiple AI assistant connections
- **Data Freshness**: Real-time context availability

### Monitoring Strategy
- **Basic Logging**: Request/response timing and errors
- **Connection Monitoring**: Track MCP client connections
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Failed requests and retry patterns

## Security Considerations

### Current Prototype (No Auth)
- **Public Endpoint**: Accessible without authentication
- **Mock Data Only**: No real user data exposed
- **Basic Input Validation**: Sanitize MCP requests
- **HTTPS**: Railway provides SSL/TLS termination

### Production Security (Future)
- **OAuth 2.1 + PKCE**: Required authentication flow
- **Resource Indicators**: RFC 8707 compliance
- **Rate Limiting**: Prevent abuse and DoS
- **Data Encryption**: End-to-end encryption for sensitive context
- **Access Controls**: User-specific context isolation

## Integration Patterns

### Data Sources (Future Production)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Google Cal    │    │     Gmail       │    │   Project Tools │
│      API        │◄──►│      API        │◄──►│  (Notion, etc.) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                Context Aggregation Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │
│  │   Calendar  │ │    Email    │ │   Projects  │ │   User   │ │
│  │   Context   │ │   Context   │ │   Context   │ │  Prefs   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │    MCP Server       │
                    │  (Context Service)  │
                    └─────────────────────┘
```

## Risk Assessment & Mitigation

### Technical Risks
- **MCP Protocol Evolution**: Breaking changes every 3-6 months
  - *Mitigation*: Version compatibility testing, gradual migration
- **Connection Reliability**: Network issues, server downtime
  - *Mitigation*: Retry logic, health monitoring, failover planning
- **Performance Bottlenecks**: Latency, concurrent connections
  - *Mitigation*: Caching, optimization, load testing

### Business Risks
- **AI Assistant API Changes**: Claude/ChatGPT MCP support changes
  - *Mitigation*: Multi-platform support, adapter patterns
- **Hosting Costs**: Railway pricing increases
  - *Mitigation*: Multi-cloud strategy, cost monitoring
- **Authentication Complexity**: OAuth implementation challenges
  - *Mitigation*: External auth providers, proven libraries

## Next Steps & Roadmap

### Phase 1: Prototype Validation
1. **Basic MCP Server**: Node.js implementation with mock data
2. **Claude Integration**: Test remote connection and context retrieval
3. **ChatGPT Integration**: Validate multi-platform support
4. **Performance Testing**: Measure latency and reliability

### Phase 2: Production Architecture
1. **Authentication Layer**: OAuth 2.1 implementation
2. **Real Data Integration**: Calendar, email, project tools
3. **Database Layer**: Persistent context storage
4. **Monitoring & Alerting**: Production-ready observability

### Phase 3: Scale & Optimize
1. **Multi-tenant Architecture**: User isolation and scaling
2. **Advanced Context**: AI-powered context relationship discovery
3. **Enterprise Features**: Team sharing, compliance, security
4. **Performance Optimization**: Caching, CDN, edge deployment

## Documentation References

### Official MCP Resources
- **Specification**: https://modelcontextprotocol.io/specification
- **Getting Started**: https://modelcontextprotocol.io/introduction
- **SDK Documentation**: https://github.com/modelcontextprotocol/
- **Community Examples**: https://github.com/search?q=mcp-server

### Railway Documentation
- **Deployment Guide**: https://railway.com/deploy
- **Node.js Deployment**: https://railway.com/deploy/nodejs
- **Environment Variables**: https://docs.railway.com/environment-variables
- **Pricing**: https://railway.com/pricing

### Authentication Resources
- **OAuth 2.1 Spec**: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1
- **Resource Indicators (RFC 8707)**: https://datatracker.ietf.org/doc/html/rfc8707
- **MCP Auth Guide**: https://modelcontextprotocol.io/docs/auth

---

*This architecture document serves as the technical foundation for Phase 1 implementation and future scaling decisions.*