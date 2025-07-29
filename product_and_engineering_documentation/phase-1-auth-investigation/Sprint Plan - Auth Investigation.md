# 🏗 Sprint Plan: `sprint-1-auth-investigation`

**Sprint Goal:**  
Create an auth-protected version of the existing working MCP server (`server-persistent.js`), implementing OAuth 2.1 + PKCE via Auth0 to secure the current context navigation tools and file operations.

**Base Architecture:**  
Build on proven `server-persistent.js` which already has working MCP tools, Claude Desktop integration, and persistent file storage. Create new `server-auth-protected.js` while preserving current working system.

---

## 🎯 Sprint Objectives

- Set up Auth0 tenant, app, and API with scoped permissions  
- Create and serve PRM (Protected Resource Metadata)  
- Implement 401 flow with proper `WWW-Authenticate` header  
- Implement JWT access token validation (via Auth0 JWKs)  
- Serve a protected tool endpoint (`/tool/summary`)  
- Validate with the MCP Inspector or Claude Connector

---

## 🤖 Tasks for the AI Developer

| Task ID | Title | Description | Status |
|--------|-------|-------------|---------|
| **AI-1** | Create Auth-Protected Server Base | Copy `server-persistent.js` → `server-auth-protected.js`. Add auth dependencies: `jsonwebtoken`, `jwks-rsa`, `node-fetch`, `dotenv`. | ✅ **COMPLETE** |
| **AI-2** | Implement Environment Config | Add `.env` loader for `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_CLIENT_ID`. Validate required variables on startup. | ✅ **COMPLETE** |
| **AI-3** | Add JWT Validation Middleware | Create `validateJWT()` function: parse Bearer token, fetch Auth0 JWKs, validate RS256 signature, check audience/expiration. | 🔄 **NEXT** |
| **AI-4** | Protect Existing MCP Endpoint | Add auth middleware to `/mcp` route. Existing tools (`navigate-context`, `write-file`, `read-context`, etc.) now require valid JWT. | ⏳ **PENDING** |
| **AI-5** | Serve Protected Resource Metadata | Add `/.well-known/prm.json` endpoint exposing current MCP tools as protected resources with required scopes. | ⏳ **PENDING** |
| **AI-6** | Implement 401 Authentication Flow | Return 401 with MCP-compliant `WWW-Authenticate` header when no/invalid token. Include `auth_param` JSON for OAuth flow. | ⏳ **PENDING** |
| **AI-7** | Add Auth-Aware Health Check | Create `/health/auth` endpoint showing auth status, JWT validation capability, and Auth0 connectivity. | ⏳ **PENDING** |
| **AI-8** | Update Package Scripts | Add `start:auth` script and document how to switch between auth/non-auth versions. | ⏳ **PENDING** |
| **AI-9** | Create Auth Testing Guide | Document how to get tokens from Auth0 and test protected endpoints manually before MCP Inspector validation. | ⏳ **PENDING** |

---

## 🙋 Tasks for the Human (Auth0 Setup)

| Task ID | Title | Description | Status |
|--------|-------|-------------|---------|
| **HUMAN-1** | Create Auth0 Account & Tenant | Sign up at [auth0.com](https://auth0.com) and create a tenant. | 🔄 **NEXT** |
| **HUMAN-2** | Create Auth0 Machine-to-Machine App | Create M2M application for MCP client authentication. Save **Client ID**, **Client Secret**, **Domain**. | ⏳ **PENDING** |
| **HUMAN-3** | Create Auth0 API for MCP Tools | Create API with identifier like `https://mcp.contextservice.local`. This becomes the JWT audience. | ⏳ **PENDING** |
| **HUMAN-4** | Define MCP Tool Scopes | Add scopes matching existing tools: `mcp:navigate`, `mcp:read`, `mcp:write`, `mcp:delete`, `mcp:prompt`. | ⏳ **PENDING** |
| **HUMAN-5** | Configure Callback & Web Origins | In the Application settings: Add `http://localhost:8000/callback` to callback URLs and localhost to web origins. | ⏳ **PENDING** |
| **HUMAN-6** | Create and Share `.env` File | Provide `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` in a `.env` file to the AI developer. | ⏳ **PENDING** |
| **HUMAN-7** | Run MCP Inspector | Use `npx @modelcontextprotocol/inspector` to validate the full OAuth + MCP flow once implementation is complete. | ⏳ **PENDING** |
| **HUMAN-8** | Notify AI Developer | Let the AI know when setup is complete and provide missing Auth0 config for live testing. | ⏳ **PENDING** |

---

## ✅ Deliverables

- ✅ New auth-protected server (`server-auth-protected.js`) with:
  - Protected `/mcp` endpoint (existing tools behind JWT authentication)
  - `/.well-known/prm.json` (exposes tool capabilities and required scopes)
  - `401` error with proper `WWW-Authenticate` MCP header
  - Scope-based authorization for each existing tool
- ✅ Preserved current working server (`server-persistent.js` unchanged)
- ✅ Package.json updated with `start:auth` script
- ✅ `.env` template and setup documentation
- ✅ Passed validation with MCP Inspector using protected tools

---

## 🧾 Example `.env` File Template

```env
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://mcp.contextservice.local
AUTH0_CLIENT_ID=your_m2m_client_id
AUTH0_CLIENT_SECRET=your_m2m_client_secret
PORT=3000
NODE_ENV=development

---

## 📊 Current Sprint Status (Session End: 2025-07-13)

### ✅ **Completed Tasks**
- **AI-1**: ✅ Auth-protected server base created (`server-auth-protected.js`)
- **AI-2**: ✅ Environment config with validation and `.env.template`
- **Dependencies**: ✅ Auth packages installed (`jsonwebtoken`, `jwks-rsa`, `node-fetch`, `dotenv`)

### 🔄 **In Progress**  
- **AI-3**: JWT Validation Middleware (ready to implement)

### 🎯 **Next Session Action Items**

**FOR HUMAN (Priority 1):**
1. Complete Auth0 setup:
   - Create Auth0 account and tenant
   - Create Machine-to-Machine application  
   - Create API with audience `https://mcp.contextservice.local`
   - Define scopes: `mcp:navigate`, `mcp:read`, `mcp:write`, `mcp:delete`, `mcp:prompt`
2. Create `.env` file with Auth0 credentials (use `.env.template` as guide)
3. Notify AI when Auth0 setup is complete

**FOR AI (Priority 2):**
1. Continue with AI-3: JWT Validation Middleware
2. Implement AI-4 through AI-9 remaining tasks
3. Test auth flow with provided `.env` credentials

### 📁 **Key Files Created/Modified**
- `server-auth-protected.js` - Auth-enabled version of persistent server
- `.env.template` - Template for Auth0 configuration
- `package.json` - Updated with auth dependencies

### 🔗 **Integration Points**
- Auth server preserves all existing MCP tools (8 tools)
- Same stateless architecture as proven `server-persistent.js`  
- Will protect existing `/mcp` endpoint with JWT validation
- Ready for MCP Inspector testing once Auth0 is configured
