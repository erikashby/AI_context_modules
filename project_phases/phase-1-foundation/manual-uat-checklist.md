# Manual UAT (User Acceptance Testing) Checklist

## Overview
This checklist provides step-by-step manual testing procedures to validate that the minimal MCP prototype meets all requirements and successfully demonstrates remote MCP server functionality with AI assistants.

## Pre-Testing Setup

### Prerequisites
- [ ] AI Developer has completed implementation
- [ ] Engineering Manager has approved code review
- [ ] Server is deployed to Railway and accessible via HTTPS
- [ ] Claude Desktop application is installed
- [ ] ChatGPT account/application is available for testing

### Test Environment Information
**Record these details before testing:**
- Railway URL: `___________________`
- Deployment Date: `___________________`
- Git Commit Hash: `___________________`
- Tester Name: `___________________`
- Test Date: `___________________`

## Phase 1: Basic Server Functionality

### UAT-001: Server Health Check
**Objective**: Verify server is running and accessible
**Steps**:
1. Open browser and navigate to `{RAILWAY_URL}/health`
2. Verify response shows: `{"status": "ok", "timestamp": "2025-XX-XXTXX:XX:XX.XXXZ"}`
3. Refresh page 3 times to ensure consistent response
4. Check timestamp updates with each request

**Expected Result**: ✅ Health endpoint returns 200 OK with correct JSON format
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

### UAT-002: Server Startup and Logs
**Objective**: Verify server starts without errors
**Steps**:
1. Check Railway deployment logs for startup messages
2. Verify no error messages during server initialization
3. Confirm server is listening on assigned PORT
4. Check for MCP server initialization messages

**Expected Result**: ✅ Clean startup with no errors, MCP server ready
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

## Phase 2: MCP Protocol Compliance

### UAT-003: MCP Capabilities Advertisement
**Objective**: Verify server properly advertises its capabilities
**Steps**:
1. Use MCP testing tool or manual JSON-RPC request to call `initialize`
2. Verify server advertises capabilities: `{"tools": true, "resources": true, "prompts": true}`
3. Call `tools/list` and verify 5 tools are listed
4. Call `resources/list` and verify 3 resources are listed
5. Call `prompts/list` and verify 2 prompts are listed

**Expected Result**: ✅ All capabilities properly advertised with correct counts
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

### UAT-004: Tool Functionality Testing
**Objective**: Test each of the 5 required tools

#### Tool 1: get_current_projects
**Steps**:
1. Call tool with no parameters
2. Verify returns array of projects from mock data
3. Check project structure includes: id, name, status, deadline, priority, description

**Expected Result**: ✅ Returns 2 projects (AI Context Service MVP, Market Research Analysis)
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

#### Tool 2: get_todays_schedule
**Steps**:
1. Call tool with no parameters
2. Verify returns today's meetings (if any) or empty array
3. Check meeting structure includes: id, title, date, time, duration, participants

**Expected Result**: ✅ Returns meetings for current date or empty array with proper structure
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

#### Tool 3: get_user_preferences
**Steps**:
1. Call tool with no parameters
2. Verify returns user preferences object
3. Check includes: communication_style, work_focus, meeting_preference, productivity_patterns

**Expected Result**: ✅ Returns complete preferences object from mock data
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

#### Tool 4: query_context
**Steps**:
1. Call tool with parameter: `{"query": "AI Context Service"}`
2. Verify returns relevant project information
3. Call tool with parameter: `{"query": "meetings"}`
4. Verify returns meeting-related context
5. Call tool with invalid query to test error handling

**Expected Result**: ✅ Returns relevant context for valid queries, handles errors gracefully
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

#### Tool 5: get_project_details
**Steps**:
1. Call tool with parameter: `{"project_id": "proj-1"}`
2. Verify returns detailed AI Context Service project info
3. Call tool with parameter: `{"project_id": "proj-2"}`
4. Verify returns Market Research Analysis project info
5. Call tool with invalid project_id to test error handling

**Expected Result**: ✅ Returns correct project details for valid IDs, error for invalid IDs
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

### UAT-005: Resource Accessibility Testing
**Objective**: Test each of the 3 required resources

#### Resource 1: user_profile
**Steps**:
1. Request resource `context://user_profile`
2. Verify returns user profile with name, timezone, work_schedule, productivity_peak
3. Check MIME type is application/json

**Expected Result**: ✅ Returns complete user profile data
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

#### Resource 2: current_projects
**Steps**:
1. Request resource `context://current_projects`
2. Verify returns array of current projects
3. Check matches data from get_current_projects tool

**Expected Result**: ✅ Returns same project data as tool with consistent format
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

#### Resource 3: upcoming_meetings
**Steps**:
1. Request resource `context://upcoming_meetings`
2. Verify returns array of upcoming meetings
3. Check includes all meeting details from mock data

**Expected Result**: ✅ Returns complete meeting data with proper structure
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

### UAT-006: Prompt Availability Testing
**Objective**: Test each of the 2 required prompts

#### Prompt 1: daily_planning
**Steps**:
1. Request prompt `daily_planning`
2. Verify prompt includes user schedule, project deadlines, productivity patterns
3. Check prompt is properly formatted for AI consumption

**Expected Result**: ✅ Returns comprehensive daily planning prompt with context
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

#### Prompt 2: project_status
**Steps**:
1. Request prompt `project_status`
2. Verify prompt includes project overview with priorities and deadlines
3. Check prompt format is suitable for AI assistant use

**Expected Result**: ✅ Returns project status summary prompt with relevant data
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

## Phase 3: AI Assistant Integration

### UAT-007: Claude Desktop Connection
**Objective**: Test remote MCP server connection with Claude Desktop
**Steps**:
1. Open Claude Desktop application
2. Navigate to MCP server configuration settings
3. Add new MCP server with Railway URL
4. Configure connection (follow setup documentation)
5. Verify connection establishes successfully
6. Check Claude can see available tools and resources

**Expected Result**: ✅ Claude Desktop connects and shows MCP server capabilities
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL ⬜ NOT_TESTABLE

**Notes**: If connection fails, document error messages and troubleshooting steps attempted.

### UAT-008: Claude Context Retrieval
**Objective**: Test AI assistant can retrieve and use context
**Prerequisite**: UAT-007 must pass
**Steps**:
1. Ask Claude: "What are my current projects?"
2. Verify Claude uses get_current_projects tool and returns project information
3. Ask Claude: "Help me plan my day"
4. Verify Claude accesses schedule and preference data
5. Ask Claude: "What's my productivity pattern?"
6. Verify Claude retrieves user preferences correctly

**Expected Result**: ✅ Claude demonstrates context awareness and provides relevant responses
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL ⬜ NOT_TESTABLE

### UAT-009: ChatGPT Connection (If Supported)
**Objective**: Test remote MCP server connection with ChatGPT
**Steps**:
1. Open ChatGPT application/interface
2. Navigate to MCP server configuration (if available)
3. Add Railway MCP server URL
4. Configure connection according to ChatGPT documentation
5. Verify connection establishes successfully
6. Test basic context retrieval

**Expected Result**: ✅ ChatGPT connects and can access MCP server data
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL ⬜ NOT_SUPPORTED ⬜ NOT_TESTABLE

**Notes**: If ChatGPT doesn't support remote MCP servers yet, mark as NOT_SUPPORTED.

## Phase 4: Performance and Reliability

### UAT-010: Response Time Testing
**Objective**: Verify response times meet performance requirements
**Steps**:
1. Measure response time for health check (should be < 100ms)
2. Measure response time for each tool call (should be < 1 second)
3. Measure response time for resource requests (should be < 1 second)
4. Test 10 consecutive requests to check consistency
5. Record all timing measurements

**Expected Result**: ✅ All responses under specified time limits
**Measurements**:
- Health check: `_____ ms`
- get_current_projects: `_____ ms`
- get_user_preferences: `_____ ms`
- query_context: `_____ ms`
- get_project_details: `_____ ms`
- user_profile resource: `_____ ms`

**Status**: ⬜ PASS ⬜ FAIL

### UAT-011: Error Handling Testing
**Objective**: Verify graceful error handling
**Steps**:
1. Send invalid JSON-RPC request
2. Call tool with missing required parameters
3. Call tool with invalid parameter values
4. Request non-existent resource
5. Send malformed HTTP request
6. Verify all errors return proper error codes and messages

**Expected Result**: ✅ All errors handled gracefully with appropriate error responses
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

### UAT-012: Connection Stability Testing
**Objective**: Test connection persistence and reliability
**Steps**:
1. Establish MCP connection with AI assistant
2. Perform 20 consecutive tool calls
3. Wait 5 minutes of inactivity, then test again
4. Test connection recovery after network interruption
5. Monitor for connection drops or timeouts

**Expected Result**: ✅ Stable connection with no drops or timeouts
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

## Phase 5: End-to-End Validation

### UAT-013: Complete Workflow Testing
**Objective**: Test realistic user workflow with AI assistant
**Prerequisite**: AI assistant connection must be working
**Steps**:
1. Ask AI: "I want to plan my day. What should I focus on?"
2. Verify AI accesses multiple data sources (projects, schedule, preferences)
3. Ask AI: "How is my AI Context Service project progressing?"
4. Verify AI retrieves specific project details
5. Ask AI: "When is my next meeting and what should I prepare?"
6. Verify AI combines meeting and project context
7. Ask AI to help with a decision using available context

**Expected Result**: ✅ AI provides contextually aware, helpful responses for all queries
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

### UAT-014: Business Value Demonstration
**Objective**: Validate that context significantly improves AI helpfulness
**Steps**:
1. Compare AI responses with vs. without context access
2. Ask same questions to AI assistant without MCP connection
3. Document difference in response quality and relevance
4. Evaluate whether context eliminates need to re-explain background
5. Assess if responses are more actionable and personalized

**Expected Result**: ✅ Clear improvement in AI response quality and relevance with context
**Qualitative Assessment**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

## Phase 6: Documentation and Deployment Validation

### UAT-015: Documentation Completeness
**Objective**: Verify all documentation is complete and accurate
**Steps**:
1. Review README.md for clear setup instructions
2. Verify deployment guide accuracy
3. Check API documentation matches actual implementation
4. Test setup instructions by following them exactly
5. Validate troubleshooting section

**Expected Result**: ✅ Complete, accurate documentation enables successful setup
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

### UAT-016: Deployment Reproducibility
**Objective**: Verify deployment can be reproduced reliably
**Steps**:
1. Follow deployment documentation exactly
2. Deploy to fresh Railway environment
3. Verify deployment succeeds without manual intervention
4. Test deployed server functionality
5. Document any additional steps required

**Expected Result**: ✅ Deployment process is reproducible and reliable
**Actual Result**: `___________________`
**Status**: ⬜ PASS ⬜ FAIL

## Final Assessment

### Overall Test Results Summary
**Total Tests**: 16
**Passed**: `_____`
**Failed**: `_____`
**Not Testable**: `_____`
**Pass Rate**: `_____%`

### Critical Test Results
**Must Pass for Success:**
- [ ] UAT-001: Server Health Check
- [ ] UAT-003: MCP Capabilities Advertisement
- [ ] UAT-004: Tool Functionality (all 5 tools)
- [ ] UAT-005: Resource Accessibility (all 3 resources)
- [ ] UAT-007: Claude Desktop Connection
- [ ] UAT-008: Claude Context Retrieval
- [ ] UAT-013: Complete Workflow Testing

### Business Validation Outcome
**Core Question**: Can we build a reliable remote MCP server that AI assistants can connect to?
**Answer**: ⬜ YES - Prototype validates technical feasibility ⬜ NO - Technical barriers identified

### Key Findings
**What Worked Well**:
```
_________________________________
_________________________________
_________________________________
```

**Issues Encountered**:
```
_________________________________
_________________________________
_________________________________
```

**Performance Metrics**:
- Average response time: `_____ ms`
- Connection reliability: `_____%`
- Error rate: `_____%`

### Recommendations for Next Phase
**Technical Recommendations**:
```
_________________________________
_________________________________
_________________________________
```

**Business Recommendations**:
```
_________________________________
_________________________________
_________________________________
```

## Approval

**UAT Completed By**: `___________________`
**Date**: `___________________`
**Engineering Manager Review**: ⬜ APPROVED ⬜ NEEDS_REVISION
**Ready for Next Phase**: ⬜ YES ⬜ NO

**Comments**:
```
_________________________________
_________________________________
_________________________________
```

---

**Note**: This UAT checklist validates both technical functionality and business value. All critical tests must pass for the prototype to be considered successful.