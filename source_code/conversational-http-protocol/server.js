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
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html><head><title>AI Context Service</title></head><body>
<h1>AI Context Service</h1>
<p>Dynamic context data service with clean URLs</p>
<h2>Available Services</h2>
<ul>
<li><a href="/notes/erikashby">Personal Notes</a> (Markdown)</li>
<li><a href="/calendar/erikashby">Calendar</a> (HTML)</li>
<li><a href="/tasks/erikashby">Tasks</a> (JSON)</li>
</ul>
<p>Testing different content types on clean URLs</p>
</body></html>`);
});

// Notes service - Markdown response on clean URL
app.get('/notes/:user', (req, res) => {
  const { user } = req.params;
  
  res.setHeader('Content-Type', 'text/markdown');
  res.send(`# ${user}'s Personal Notes

## Project Ideas
- Build a conversational HTTP protocol for AI context
- Create clean URL-based context APIs  
- Test markdown delivery on path-based routing

## Meeting Notes
**Today**: Discovered AI assistant web content limitations
- HTML content works ✅
- JSON responses blocked ❌ 
- URL parameters may be filtered ❌

**Next**: Test clean URLs with different content types

## Personal Reminders
- Test /notes/user (markdown)
- Test /calendar/user (HTML)
- Test /tasks/user (JSON)
- Validate which content types work

## Context Metadata
- User timezone: America/New_York
- Communication preference: Direct and concise
- Current focus: Content type experimentation
- Last updated: ${new Date().toISOString()}

---
*This is a markdown file served from a clean URL path*`);
});

// Calendar service - HTML response on clean URL
app.get('/calendar/:user', (req, res) => {
  const { user } = req.params;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html><head><title>${user}'s Calendar</title></head><body>
<h1>${user}'s Calendar</h1>

<h2>Today's Schedule</h2>

<h3>9:00 AM - 10:00 AM: Team Standup</h3>
<ul>
<li><strong>Location:</strong> Conference Room A</li>
<li><strong>Attendees:</strong> Engineering Team</li>
<li><strong>Notes:</strong> Daily sync and blockers review</li>
</ul>

<h3>2:00 PM - 3:00 PM: Protocol Review</h3>
<ul>
<li><strong>Location:</strong> Virtual</li>
<li><strong>Notes:</strong> Discuss content type testing results</li>
<li><strong>Focus:</strong> AI assistant web content limitations</li>
</ul>

<h3>4:00 PM - 5:00 PM: Development Session</h3>
<ul>
<li><strong>Location:</strong> Home Office</li>
<li><strong>Focus:</strong> Clean URL implementation</li>
<li><strong>Goal:</strong> Test markdown vs HTML vs JSON delivery</li>
</ul>

<h2>Tomorrow</h2>

<h3>10:00 AM - 11:00 AM: Results Analysis</h3>
<ul>
<li><strong>Topic:</strong> Review which content types work with AI assistants</li>
<li><strong>Decision:</strong> Choose optimal approach for context service</li>
</ul>

<hr>
<p><em>Calendar data served as HTML from clean URL: /calendar/${user}</em></p>
<p><em>Last updated: ${new Date().toISOString()}</em></p>

</body></html>`);
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

// Tasks service - JSON response on clean URL
app.get('/tasks/:user', (req, res) => {
  const { user } = req.params;
  
  res.setHeader('Content-Type', 'application/json');
  res.json({
    status: "success",
    user: user,
    content_type: "json",
    url_type: "clean_path",
    data: {
      tasks: {
        high_priority: [
          {
            id: "task-1",
            title: "Test clean URL with JSON content",
            status: "in_progress",
            due_date: "2025-07-08",
            description: "Validate if AI assistants can consume JSON from clean URLs"
          },
          {
            id: "task-2", 
            title: "Compare markdown vs HTML vs JSON responses",
            status: "pending",
            due_date: "2025-07-08",
            description: "Determine which content types work with AI web fetching"
          },
          {
            id: "task-3",
            title: "Document AI assistant web content limitations",
            status: "pending", 
            due_date: "2025-07-09",
            description: "Create findings report on content type restrictions"
          }
        ],
        medium_priority: [
          {
            id: "task-4",
            title: "Design optimal context delivery protocol",
            status: "pending",
            due_date: "2025-07-10",
            description: "Based on content type test results"
          }
        ],
        recently_completed: [
          {
            id: "task-completed-1",
            title: "Discovered URL parameter limitations",
            completed_date: "2025-07-08",
            notes: "AI assistants may block URLs with query parameters"
          },
          {
            id: "task-completed-2", 
            title: "Confirmed HTML content works",
            completed_date: "2025-07-08",
            notes: "HTML responses are processed by AI assistants"
          }
        ]
      }
    },
    metadata: {
      last_updated: new Date().toISOString(),
      total_tasks: 6,
      data_type: "json_task_list",
      served_from: `/tasks/${user}`,
      experiment: "content_type_testing"
    }
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
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({
    error: "service_not_found",
    message: `The requested service ${req.originalUrl} was not found`,
    available_services: {
      home: "/",
      notes: "/notes?user=erikashby",
      calendar: "/calendar?user=erikashby",
      tasks: "/tasks?user=erikashby"
    }
  });
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