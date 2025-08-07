# Phase 1 User Acceptance Testing Plan
**Date**: July 30, 2025  
**Status**: Ready for Execution  
**Estimated Time**: 2-3 hours  

## 🎯 UAT Objective

Validate that Phase 1 multi-user MCP server works as intended before proceeding with Phase 2 development.

## 📋 Test Categories

### **UAT-1: New User Onboarding Flow**
**Goal**: Verify complete new user experience works flawlessly

### **UAT-2: Existing User Workflow**  
**Goal**: Confirm Erik's current setup still works optimally

### **UAT-3: Performance Validation**
**Goal**: Verify optimization targets are met

### **UAT-4: Multi-User Security Isolation**
**Goal**: Confirm users cannot access each other's data

---

## 🧪 Detailed Test Scenarios

### **UAT-1: New User Onboarding Flow**

#### **Test 1.1: Connect Claude to New User Endpoint**
**Setup**: 
- User: `testuser-july30` (new user, no existing projects)
- Endpoint: `https://ai-context-service-private.onrender.com/mcp/testuser-july30`

**Claude Desktop Configuration**:
```json
{
  "mcpServers": {
    "ai-context-testuser": {
      "command": "npx", 
      "args": ["-y", "@modelcontextprotocol/server-stdio", "https://ai-context-service-private.onrender.com/mcp/testuser-july30"]
    }
  }
}
```

**Test Steps**:
1. Add configuration to Claude Desktop
2. Restart Claude Desktop
3. Verify connection established

**Expected Result**: ✅ Claude connects without errors

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 1.2: Initial Project Listing**
**Command**: 
```
Use the list_projects tool to see what's available for this new user.
```

**Expected Result**: 
- Shows message about no projects found
- Includes usage guidance for new users
- Recommends using `create_project` to get started

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 1.3: Create First Project**
**Command**:
```
Use the create_project tool to create a project called "my-first-project" using the "personal-effectiveness-v1" module.
```

**Expected Result**:
- Project created successfully
- Success message with project details
- Project directory structure established

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 1.4: Verify Project Structure**
**Command**:
```
Use the explore_project tool to show me the structure of "my-first-project".
```

**Expected Result**:
- Complete project structure displayed
- All folders from personal-effectiveness-v1 module present
- File structure matches module template

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 1.5: Test File Operations**
**Command**:
```
Use the read_file tool to read "my-first-project" and "README.md" file.
```

**Expected Result**:
- README.md content displays correctly
- File metadata included (size, last updated)
- Content matches module template

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 1.6: Test Write Operations**
**Command**:
```
Use the write_file tool to create a new file in "my-first-project" at path "current-status/test-priorities.md" with content:
# Test Priorities
This is a test file created during UAT.
- Priority 1: Complete UAT testing
- Priority 2: Begin Phase 2 development
```

**Expected Result**:
- File created successfully
- Confirmation message with file details
- File persists across server restarts

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

### **UAT-2: Existing User Workflow (Erik's Endpoint)**

#### **Test 2.1: Connect to Erik's Endpoint**
**Setup**: Use existing Erik configuration
**Endpoint**: `https://ai-context-service-private.onrender.com/mcp/erik`

**Test Steps**:
1. Verify Claude Desktop connection to Erik's endpoint
2. Confirm no interference from testuser setup

**Expected Result**: ✅ Connection works as before

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 2.2: Instant Context Retrieval**
**Command**:
```
Use the get_current_context tool for the "my-effectiveness" project to get my current priorities and weekly focus.
```

**Expected Result**:
- Responds in <5 seconds
- Shows current priorities, weekly focus, and annual goals
- Content is Erik's actual current context

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 2.3: Full Project Overview**
**Command**:
```
Use the get_project_overview tool for "my-effectiveness" to get the complete project view with key files.
```

**Expected Result**:
- Complete project structure displayed
- Key files content included (README.md, priorities.md, this-week.md)
- Response time <3 seconds

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

### **UAT-3: Performance Validation**

#### **Test 3.1: Batch File Reading Performance**
**Command**:
```
Use the read_multiple_files tool to read these files from "my-effectiveness":
["current-status/priorities.md", "current-status/this-week.md", "goals-and-vision/annual-goals.md", "README.md"]
```

**Expected Result**:
- All files read in single request
- Response time <2 seconds
- Success/error status for each file

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 3.2: Initial Context Gathering Speed**
**Command**:
```
Time how long it takes to get complete context. First use list_projects, then get_current_context, then get_project_overview for your main project.
```

**Expected Result**:
- Complete context in <5 seconds total
- 2-3 tool calls maximum (vs 10+ before optimization)
- All essential information available quickly

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

### **UAT-4: Multi-User Security Isolation**

#### **Test 4.1: Cross-User Access Prevention**
**Setup**: While connected as `testuser-july30`

**Command**:
```
Try to read a file from Erik's project using read_file tool with project_id "my-effectiveness" and file_path "current-status/priorities.md"
```

**Expected Result**:
- Access denied error
- Cannot access other user's projects
- Clear error message about user isolation

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 4.2: Project Isolation Verification**
**Setup**: Switch back to Erik's endpoint

**Command**:
```
Use list_projects to confirm Erik's projects are isolated from testuser's projects.
```

**Expected Result**:
- Only Erik's projects visible
- No cross-contamination with testuser projects
- Each user has independent project space

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

## 📊 UAT Results Summary

### **Overall Status**: ⏳ Testing in Progress

### **Test Results**:
- **UAT-1 (New User Onboarding)**: ⏳ 0/6 tests completed
- **UAT-2 (Existing User Workflow)**: ⏳ 0/3 tests completed  
- **UAT-3 (Performance Validation)**: ⏳ 0/2 tests completed
- **UAT-4 (Security Isolation)**: ⏳ 0/2 tests completed

### **Critical Issues Found**: 
_[To be documented as testing progresses]_

### **Phase 1 Completion Decision**: 
- ⏳ **Pending** - Awaiting UAT completion
- ❌ **Blocked** - Critical issues must be resolved first
- ✅ **Approved** - Ready for Phase 2

---

## 🚀 Next Steps After UAT

### **If UAT Passes**:
1. Update `PHASE-1-COMPLETION-CHECKLIST.md` with ✅ status
2. Begin Phase 2A development immediately
3. Document lessons learned

### **If Issues Found**:
1. Document all issues in `PHASE-1-ISSUES-LOG.md`
2. Categorize: Blocking vs. Non-blocking for Phase 2
3. Fix blocking issues before Phase 2 development
4. Schedule non-blocking fixes for Phase 2 parallel development

---

**Testing Instructions for Erik**:
1. Work through each test scenario in order  
2. Record actual results vs. expected results
3. Note any errors, performance issues, or unexpected behavior
4. Take screenshots if helpful for issue documentation
5. We'll review results together and determine next steps