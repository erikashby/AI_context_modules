# AI Context Service MVP - System Architecture
**Date**: July 30, 2025  
**Phase**: Phase 2 Web Portal Integration  

## 🏗️ High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS & CLIENTS                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│   Claude Web    │ │ Claude      │ │   Web Browser   │
│   (Future)      │ │ Desktop     │ │   (New Users)   │
│                 │ │ (Current)   │ │                 │
│ - Via MCP       │ │ - Via MCP   │ │ - Via HTTP      │
│   Protocol      │ │   Protocol  │ │   Web UI        │
└─────────────────┘ └─────────────┘ └─────────────────┘
          │               │               │
          │               │               │
          └───────────────┼───────────────┘
                          │ 
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 AI CONTEXT SERVICE SERVER                       │
│                (Single Node.js/Express Server)                 │
│                                                                 │
│  ┌──────────────────┐              ┌──────────────────────────┐ │
│  │   MCP PROTOCOL   │              │      WEB INTERFACE       │ │
│  │    HANDLERS      │              │       (Phase 2)          │ │
│  │   (Phase 1)      │              │                          │ │
│  │                  │              │  ┌─────────────────────┐ │ │
│  │ • 12 MCP Tools   │              │  │    Web Routes       │ │ │
│  │ • User Isolation │              │  │                     │ │ │
│  │ • Performance    │              │  │ /web/signup         │ │ │
│  │   Optimization   │              │  │ /web/login          │ │ │
│  │                  │              │  │ /web/dashboard      │ │ │
│  │ Routes:          │              │  │ /web/projects/*     │ │ │
│  │ /mcp/{username}  │              │  │ /web/connect        │ │ │
│  │ /health          │              │  │ /web/static/*       │ │ │
│  │ /                │              │  └─────────────────────┘ │ │
│  └──────────────────┘              └──────────────────────────┘ │
│                          │                          │           │
│                          └──────────┬───────────────┘           │
│                                     │                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              SHARED INFRASTRUCTURE                          │ │
│  │                                                             │ │
│  │ • User Management (sessions, auth)                         │ │
│  │ • Project Operations (create, read, update, delete)       │ │
│  │ • File System Operations                                   │ │
│  │ • Module Template System                                   │ │
│  │ • Security & Validation                                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FILE SYSTEM STORAGE                          │
│                 (Persistent Data Layer)                        │
│                                                                 │
│  users/                          modules/                      │
│  ├── alice/                      ├── personal-effectiveness-v1/ │
│  │   ├── profile/                │   ├── README.md             │
│  │   │   └── user.json           │   ├── current-status/       │
│  │   └── projects/               │   ├── goals-and-vision/     │
│  │       └── work-effectiveness/ │   └── ...                   │
│  ├── erik/                       └── work-project-v1/          │
│  │   ├── profile/                    ├── README.md             │
│  │   │   └── user.json               └── ...                   │
│  │   └── projects/                                             │
│  │       ├── my-effectiveness/                                 │
│  │       └── test-project/                                     │
│  └── {new-web-users}/                                          │
│      ├── profile/                                              │
│      └── projects/                                             │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Patterns

### **MCP Client Workflow (Existing - Phase 1)**
```
Claude Desktop → MCP Protocol → /mcp/{username} → User Projects → File System
```

### **Web User Workflow (New - Phase 2)**
```
Web Browser → HTTP/HTML → /web/* routes → User Management → File System
                                      ↓
                              Generate MCP Endpoint → /mcp/{username}
```

### **Project Creation Flow**
```
Web UI: Create Project → Shared Infrastructure → Module Templates → User File System
MCP: create_project   → Shared Infrastructure → Module Templates → User File System
```

## 🏢 Component Responsibilities

### **MCP Protocol Handlers (Phase 1 - Preserve)**
- **Function**: AI client integration via MCP protocol
- **Routes**: `/mcp/{username}`, `/health`, `/`
- **Tools**: 12 MCP tools (list_projects, read_file, etc.)
- **Users**: Claude Desktop, future AI clients
- **Status**: ✅ Complete, must preserve exactly

### **Web Interface (Phase 2 - New)**
- **Function**: Human user onboarding and management
- **Routes**: `/web/*` (signup, login, dashboard, etc.)
- **Features**: User registration, project creation, MCP setup
- **Users**: Non-technical users via web browsers
- **Status**: 🚧 To be built

### **Shared Infrastructure (Both Phases)**
- **Function**: Common business logic and data operations
- **Components**: User management, file operations, security
- **Templates**: Module system for project creation
- **Storage**: File system with user isolation
- **Status**: ✅ Exists, extend for web features

### **File System Storage (Foundation)**
- **Function**: Persistent data storage with user isolation
- **Structure**: `users/{username}/` with profile and projects
- **Modules**: Template system in `modules/` directory
- **Security**: Directory-based user isolation
- **Status**: ✅ Complete, proven architecture

## 🔗 Integration Points

### **Shared User Management**
```
Web Registration → Create user directory → Available to MCP
MCP Project Ops → User file system ← Web Dashboard Views
```

### **Shared Project Operations**
```
Web: Create Project → CLI createProject() → File System
MCP: create_project → CLI createProject() → File System
```

### **Shared Authentication**
```
Web: Session-based auth → User profile validation
MCP: URL-based auth → Username in URL path
```

## 📡 External Interfaces

### **Inbound Connections**
- **Claude Desktop**: MCP protocol over HTTP to `/mcp/{username}`
- **Web Browsers**: HTTP/HTML to `/web/*` routes
- **Health Checks**: HTTP GET to `/health`

### **Outbound Dependencies**
- **None**: Self-contained system with file system storage
- **Future**: Could integrate calendar, email, etc. via MCP

## 🛡️ Security Architecture

### **User Isolation**
- **MCP**: URL-based user routing (`/mcp/{username}`)
- **Web**: Session-based authentication with user scoping
- **File System**: Directory-based isolation (`users/{username}/`)

### **Data Protection**
- **File System**: User directories with access validation
- **Sessions**: Secure session management for web users
- **Input Validation**: Santization for all user inputs

## 🚀 Scalability Considerations

### **Current Architecture** (Sufficient for MVP)
- **Single Server**: Node.js/Express on Render.com
- **File System**: Local file storage with user directories
- **Stateless**: Fresh server instances per MCP request

### **Future Scaling Options** (Post-MVP)
- **Database**: Replace file system with PostgreSQL
- **Load Balancing**: Multiple server instances
- **Caching**: Redis for session and data caching

---

## 📋 Architecture Validation Questions

**Erik, please review this architecture and confirm:**

1. **✅ Does this preserve existing MCP functionality completely?**
2. **✅ Does the single-server approach make sense for Phase 2?**
3. **✅ Is the shared infrastructure approach appropriate?**
4. **✅ Are there any security concerns with this design?**
5. **✅ Does this support the business requirements for web user onboarding?**

**Any changes needed before we proceed with Phase 2A implementation?**