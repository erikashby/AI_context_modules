// Conversational HTTP-to-Markdown Protocol Server
// A proof of concept for AI-to-AI communication via HTTP that returns markdown instructions

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// In-memory session store (for proof of concept)
const sessions = new Map();

// Generate a simple session PIN (hardcoded for testing)
function generatePin() {
  return "1234"; // Hardcoded for testing purposes
}

// Root endpoint - shows available services
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/markdown');
  res.send(`# AI Context Service

Hello! I'm an AI-to-AI conversational HTTP service.

## Available Services

Try these URLs:
- [Personal Notes](/notes?user=erikashby)
- [Calendar](/calendar?user=erikashby) 
- [Tasks](/tasks?user=erikashby)

Each service will guide you through authentication and provide contextual data.
`);
});

// Notes service - multi-step authentication
app.get('/notes', (req, res) => {
  const { user, pin } = req.query;
  
  if (!user) {
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(`# Error: Missing User

Please provide a user parameter in the URL.
Example: /notes?user=erikashby
`);
  }

  // Step 1: Initial request - generate PIN and ask for it
  if (!pin) {
    const sessionPin = generatePin();
    sessions.set(user, { pin: sessionPin, created: Date.now() });
    
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(`# Personal Notes Service

Hello! I'm responding to a request for ${user}'s personal notes.

## Authentication Required

To access ${user}'s notes, I need you to:

1. **Ask ${user} for their PIN**
2. **Then fetch this URL**: \`/notes?user=${user}&pin={PIN}\`

Replace {PIN} with the actual PIN the user provides.

---
*This is a dynamic AI-to-AI conversation. Authentication required to proceed.*
`);
  }

  // Step 2: Validate PIN and return notes
  const session = sessions.get(user);
  if (!session || session.pin !== pin) {
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(`# Authentication Failed

Invalid PIN for user ${user}.

Please ask the user for the correct PIN and try again.
`);
  }

  // Success! Return the actual notes
  res.setHeader('Content-Type', 'text/markdown');
  res.send(`# ${user}'s Personal Notes

✅ **Authentication successful!**

## Current Notes

### Project Ideas
- Build a conversational HTTP protocol for AI context
- Create a markdown-based command system
- Test AI-to-AI communication patterns

### Meeting Notes
- **Today**: Discussed MCP protocol alternatives
- **Next**: Implement proof of concept for HTTP-markdown protocol

### Personal Reminders
- Review render.yaml deployment configuration
- Test the conversational flow with Claude
- Iterate on the protocol design

### Context Data
- User timezone: America/New_York
- Preferred communication: Direct and concise
- Current focus: Protocol experimentation

---
*Session authenticated at ${new Date().toISOString()}*
`);
});

// Calendar service - different authentication pattern
app.get('/calendar', (req, res) => {
  const { user, confirm } = req.query;
  
  if (!user) {
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(`# Error: Missing User

Please provide a user parameter in the URL.
`);
  }

  if (!confirm) {
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(`# Calendar Access Request

I have calendar data for ${user}, but need confirmation.

## Next Step

Ask ${user}: "Can I access your calendar data?"

If they say yes, use this URL: \`/calendar?user=${user}&confirm=yes\`
`);
  }

  if (confirm === 'yes') {
    res.setHeader('Content-Type', 'text/markdown');
    res.send(`# ${user}'s Calendar

## Today's Schedule

### 9:00 AM - 10:00 AM
**Team Standup**
- Location: Conference Room A
- Attendees: Engineering Team

### 2:00 PM - 3:00 PM  
**Protocol Review**
- Location: Virtual
- Notes: Discuss MCP alternatives

### 4:00 PM - 5:00 PM
**Coding Session**
- Location: Home Office
- Focus: Proof of concept development

## Tomorrow

### 10:00 AM - 11:00 AM
**Product Planning**
- Review protocol test results
`);
  } else {
    res.setHeader('Content-Type', 'text/markdown');
    res.send(`# Access Denied

User ${user} did not grant calendar access.

You can try asking again or use a different service.
`);
  }
});

// Admin endpoint to check current PIN (for testing)
app.get('/admin/pin', (req, res) => {
  const { user } = req.query;
  
  if (!user) {
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(`# Admin: PIN Check

Provide user parameter: /admin/pin?user=erikashby
`);
  }
  
  const session = sessions.get(user);
  if (!session) {
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(`# Admin: No Session

No active session found for user ${user}.

Request /notes?user=${user} first to generate a PIN.
`);
  }
  
  res.setHeader('Content-Type', 'text/markdown');
  res.send(`# Admin: PIN for ${user}

Current PIN: **${session.pin}**

Session created: ${new Date(session.created).toISOString()}
`);
});

// Tasks service - immediate access pattern
app.get('/tasks', (req, res) => {
  const { user } = req.query;
  
  if (!user) {
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(`# Error: Missing User

Please provide a user parameter.
`);
  }

  res.setHeader('Content-Type', 'text/markdown');
  res.send(`# ${user}'s Task List

## High Priority
- [ ] Complete conversational HTTP protocol proof of concept
- [ ] Test AI-to-AI markdown communication
- [ ] Deploy to Render for live testing

## Medium Priority
- [ ] Document the protocol specification
- [ ] Create more complex authentication flows
- [ ] Test with different AI clients

## Low Priority
- [ ] Add encryption for sensitive data
- [ ] Implement rate limiting
- [ ] Create web interface for configuration

## Recently Completed
- [x] Research MCP protocol alternatives
- [x] Set up development environment
- [x] Create initial server implementation

---
*Tasks updated: ${new Date().toISOString()}*
`);
});

// Health check for deployment
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Conversational HTTP-to-Markdown Service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.setHeader('Content-Type', 'text/markdown');
  res.status(404).send(`# 404 - Service Not Found

The requested service \`${req.originalUrl}\` was not found.

## Available Services
- [Home](/) - Service directory
- [Notes](/notes?user=erikashby) - Personal notes
- [Calendar](/calendar?user=erikashby) - Calendar data
- [Tasks](/tasks?user=erikashby) - Task list
`);
});

app.listen(PORT, () => {
  console.log(`Conversational HTTP server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log(`  http://localhost:${PORT}/`);
  console.log(`  http://localhost:${PORT}/notes?user=erikashby`);
  console.log(`  http://localhost:${PORT}/calendar?user=erikashby`);
  console.log(`  http://localhost:${PORT}/tasks?user=erikashby`);
});

module.exports = app;