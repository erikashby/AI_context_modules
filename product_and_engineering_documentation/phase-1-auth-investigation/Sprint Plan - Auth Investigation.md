# 🏗 Sprint Plan: `sprint-1-auth-investigation`

**Sprint Goal:**  
Enable a prototype MCP server to support OAuth 2.1 + PKCE via Auth0, serve proper metadata, validate tokens, and support Claude-style secure tool access.

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

| Task ID | Title | Description |
|--------|-------|-------------|
| **AI-1** | Initialize FastAPI Project | Scaffold project with `FastAPI`, `httpx`, `authlib`, `python-dotenv`. Structure app for config, routes, and token validation. |
| **AI-2** | Implement `.env` Config Loader | Load `.env` for `AUTH0_DOMAIN` and `AUTH0_AUDIENCE`, and raise errors if missing. |
| **AI-3** | Serve `/.well-known/prm.json` | Serve static JSON with metadata: `authorization_servers`, scopes, token endpoints, etc. |
| **AI-4** | Implement `/tool/summary` Endpoint | Return dummy content (e.g., JSON response). This should be protected by valid JWT access tokens. |
| **AI-5** | JWT Validation Logic | Parse `Authorization: Bearer <token>`, fetch JWKs, validate using RS256, check audience and expiration. |
| **AI-6** | 401 Fallback with `WWW-Authenticate` | If no token or bad token, return 401 with MCP-compliant header and `auth_param` JSON. |
| **AI-7** | Test Route (Optional) | Add `/tool/test` or similar route to manually test token or user claims. |
| **AI-8** | Add README.md | Auto-generate usage notes and `.env` instructions for local dev and testing. |
| **AI-9** | MCP Inspector Compatibility | Ensure `/tool/summary` passes `npx @modelcontextprotocol/inspector` with valid tokens. |

---

## 🙋 Tasks for the Human (Auth0 Setup)

| Task ID | Title | Description |
|--------|-------|-------------|
| **HUMAN-1** | Create Auth0 Account & Tenant | Sign up at [auth0.com](https://auth0.com) and create a tenant. |
| **HUMAN-2** | Create Auth0 Application | Go to Applications → Create App → select "Regular Web App". Save **Client ID** and **Domain**. |
| **HUMAN-3** | Create Auth0 API | Go to APIs → Create API. Use something like `https://mcp.tools.local` as the identifier (this is the `audience`). |
| **HUMAN-4** | Add API Scopes | Define scopes like `tools:summary`, `tools:query` in the API's Permissions tab. |
| **HUMAN-5** | Configure Callback & Web Origins | In the Application settings: Add `http://localhost:8000/callback` to callback URLs and localhost to web origins. |
| **HUMAN-6** | Create and Share `.env` File | Provide `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` in a `.env` file to the AI developer. |
| **HUMAN-7** | Run MCP Inspector | Use `npx @modelcontextprotocol/inspector` to validate the full OAuth + MCP flow once implementation is complete. |
| **HUMAN-8** | Notify AI Developer | Let the AI know when setup is complete and provide missing Auth0 config for live testing. |

---

## ✅ Deliverables

- ✅ Working FastAPI server with:
  - `/tool/summary` (protected by bearer token)
  - `/.well-known/prm.json` (exposes scopes and auth endpoints)
  - `401` error with `WWW-Authenticate` MCP header
- ✅ `.env` and README for setup
- ✅ Passed validation with MCP Inspector

---

## 🧾 Example `.env` File Template

```env
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://your-api-id
