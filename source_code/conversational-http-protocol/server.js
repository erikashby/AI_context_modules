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
  res.setHeader('Content-Type', 'application/json');
  res.json({
    service: "AI Context Service",
    description: "Dynamic context data service",
    endpoints: {
      notes: "/notes?user=erikashby",
      calendar: "/calendar?user=erikashby", 
      tasks: "/tasks?user=erikashby"
    },
    timestamp: new Date().toISOString()
  });
});

// Notes service - immediate access (no authentication)
app.get('/notes', (req, res) => {
  const { user } = req.query;
  
  if (!user) {
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      error: "missing_user_parameter",
      message: "User parameter required"
    });
  }

  // Return notes immediately - no authentication required
  res.setHeader('Content-Type', 'application/json');
  res.json({
    status: "success",
    user: user,
    authenticated: true,
    data: {
      personal_notes: {
        project_ideas: [
          "Build a conversational HTTP protocol for AI context",
          "Create a structured data API for AI assistants",
          "Test JSON-based dynamic context delivery"
        ],
        meeting_notes: [
          {
            date: "today",
            topic: "Discussed MCP protocol alternatives and JSON approaches"
          },
          {
            date: "next",
            topic: "Implement proof of concept for dynamic JSON context"
          }
        ],
        personal_reminders: [
          "Review deployment configuration",
          "Test JSON response with AI assistants", 
          "Validate dynamic content delivery without prompt injection"
        ],
        context_metadata: {
          user_timezone: "America/New_York",
          communication_preference: "Direct and concise",
          current_focus: "JSON protocol experimentation",
          productivity_peak: "morning"
        }
      }
    },
    session_info: {
      authenticated_at: new Date().toISOString(),
      session_type: "dynamic_context_delivery"
    }
  });
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
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      error: "missing_user_parameter",
      message: "User parameter required"
    });
  }

  res.setHeader('Content-Type', 'application/json');
  res.json({
    status: "success",
    user: user,
    data: {
      tasks: {
        high_priority: [
          {
            id: "task-1",
            title: "Complete JSON protocol proof of concept",
            status: "in_progress",
            due_date: "2025-07-08"
          },
          {
            id: "task-2", 
            title: "Test dynamic JSON content with AI assistants",
            status: "pending",
            due_date: "2025-07-08"
          },
          {
            id: "task-3",
            title: "Validate security boundary compliance",
            status: "pending", 
            due_date: "2025-07-09"
          }
        ],
        medium_priority: [
          {
            id: "task-4",
            title: "Document JSON protocol specification",
            status: "pending",
            due_date: "2025-07-10"
          },
          {
            id: "task-5",
            title: "Create structured authentication flows",
            status: "pending",
            due_date: "2025-07-12"
          }
        ],
        recently_completed: [
          {
            id: "task-completed-1",
            title: "Research MCP protocol alternatives",
            completed_date: "2025-07-07"
          },
          {
            id: "task-completed-2", 
            title: "Set up development environment",
            completed_date: "2025-07-06"
          }
        ]
      }
    },
    metadata: {
      last_updated: new Date().toISOString(),
      total_tasks: 7,
      data_type: "dynamic_task_list"
    }
  });
});
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