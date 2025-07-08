# Conversational HTTP Protocol

A proof of concept for AI-to-AI communication using HTTP endpoints that return markdown instructions.

## Concept

Instead of using MCP, this protocol allows AI assistants to:
1. Fetch URLs that return markdown instructions
2. Follow those instructions (like asking users for authentication)
3. Make follow-up requests to get actual contextual data

## Example Flow

1. AI fetches: `/notes?user=erikashby`
2. Server responds with markdown asking for PIN
3. AI asks user for PIN
4. AI fetches: `/notes?user=erikashby&pin=1234`
5. Server responds with actual notes data

## Endpoints

- `GET /` - Service directory
- `GET /notes?user={user}` - Personal notes (requires PIN)
- `GET /calendar?user={user}` - Calendar data (requires confirmation)
- `GET /tasks?user={user}` - Task list (immediate access)
- `GET /health` - Health check

## Testing

```bash
npm install
npm start
```

Then test with:
```bash
curl http://localhost:3000/
curl http://localhost:3000/notes?user=erikashby
curl http://localhost:3000/tasks?user=erikashby
```

## Protocol Design

The protocol uses:
- **HTTP GET** for all requests
- **text/markdown** content type for responses
- **URL parameters** for session/auth state
- **Markdown instructions** for AI guidance
- **Multi-step flows** for authentication

This creates a conversational protocol where the server can guide the AI through complex authentication and data access patterns.