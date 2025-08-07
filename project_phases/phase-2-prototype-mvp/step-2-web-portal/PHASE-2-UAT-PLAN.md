# Phase 2 Web Portal - User Acceptance Testing Plan
**Date**: July 30, 2025  
**Status**: Ready for Testing  
**Estimated Time**: 1-2 hours  

## 🎯 UAT Objective

Validate that Phase 2 web portal works flawlessly and integrates properly with existing Phase 1 MCP functionality.

## 📋 Test Categories

### **UAT-2.1: Home Page & Navigation**
**Goal**: Verify landing page works and looks professional

### **UAT-2.2: User Signup Workflow**  
**Goal**: Complete user registration and directory provisioning

### **UAT-2.3: User Login Workflow (When Implemented)**
**Goal**: Authentication and session management

### **UAT-2.4: MCP Integration**
**Goal**: Verify new web users can use MCP endpoints

### **UAT-2.5: Existing Functionality Preservation**
**Goal**: Confirm Phase 1 MCP functionality still works

---

## 🧪 Detailed Test Scenarios

### **UAT-2.1: Home Page & Navigation**

#### **Test 2.1.1: Home Page Loading**
**URL**: `https://ai-context-service-private.onrender.com/`

**Test Steps**:
1. Visit the home page
2. Verify page loads within 3 seconds
3. Check visual design matches expectations

**Expected Result**:
- ✅ Dark theme (gray-900 background)
- ✅ Purple branding with gradient logo
- ✅ "AI Context Service" heading
- ✅ Subtitle about AI assistant context
- ✅ Two buttons: "Get Started" (purple) and "Sign In" (outlined)
- ✅ Three feature cards: Secure, User-Friendly, Fast
- ✅ Professional footer

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 2.1.2: Button Navigation**
**Setup**: On home page

**Test Steps**:
1. Click "Get Started" button
2. Verify redirects to signup page
3. Go back to home page
4. Click "Sign In" button
5. Verify redirects to login page (when implemented)

**Expected Result**:
- ✅ "Get Started" → `/signup` 
- ✅ "Sign In" → `/login`
- ✅ Smooth navigation without errors

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 2.1.3: Responsive Design**
**Setup**: On home page

**Test Steps**:
1. View on desktop browser
2. Resize browser window to mobile width
3. Check layout adapts properly
4. Test on actual mobile device if available

**Expected Result**:
- ✅ Layout adapts to different screen sizes
- ✅ Text remains readable
- ✅ Buttons stack vertically on mobile
- ✅ Feature cards respond appropriately

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

### **UAT-2.2: User Signup Workflow**

#### **Test 2.2.1: Signup Form Display**
**URL**: `https://ai-context-service-private.onrender.com/signup`

**Test Steps**:
1. Navigate to signup page
2. Verify form displays correctly
3. Check all form fields are present

**Expected Result**:
- ✅ Beautiful form matching Lovable design
- ✅ Logo and "Welcome" header
- ✅ Form fields: Full Name, Email, Username, Password, Confirm Password
- ✅ Required field indicators (red asterisks)
- ✅ Username shows MCP endpoint preview
- ✅ "Create Account" button (purple gradient)
- ✅ "Already have account? Sign in" link

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 2.2.2: Form Validation - Client Side**
**Setup**: On signup form

**Test Steps**:
1. Try submitting empty form
2. Enter invalid email format
3. Enter username with special characters
4. Enter password less than 8 characters
5. Enter non-matching passwords
6. Verify real-time feedback

**Expected Result**:
- ✅ Empty fields show browser validation
- ✅ Invalid email shows error on blur
- ✅ Username preview updates in real-time
- ✅ Password mismatch shows visual feedback
- ✅ Focus states show purple highlights

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 2.2.3: Successful User Registration**
**Setup**: On signup form

**Form Data**:
```
Full Name: Erik Test User
Email: erik.test@example.com  
Username: erik-test-2025
Password: testpassword123
Confirm Password: testpassword123
```

**Test Steps**:
1. Fill out form with valid data
2. Click "Create Account"
3. Wait for processing
4. Verify success message

**Expected Result**:
- ✅ Form submits without errors
- ✅ Success message appears: "Account created successfully! You can now sign in with username: erik-test-2025"
- ✅ Form clears after success
- ✅ User directory created on server

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 2.2.4: Duplicate Username Prevention**
**Setup**: On signup form (after Test 2.2.3)

**Test Steps**:
1. Try to register with same username: `erik-test-2025`
2. Use different email but same username
3. Submit form

**Expected Result**:
- ✅ Error message: "Username is invalid or already taken..."
- ✅ Form data preserved (except passwords)
- ✅ User can correct and retry

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 2.2.5: Server-Side Validation**
**Setup**: On signup form

**Test Scenarios**:
1. **Empty fields**: Submit form with missing required fields
2. **Invalid email**: Submit with `invalid-email`
3. **Short password**: Submit with `123` as password
4. **Password mismatch**: Different password and confirmation

**Expected Result**:
- ✅ Each validation shows appropriate error message
- ✅ Form data preserved on error
- ✅ Error styling appears
- ✅ User can correct and resubmit

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

### **UAT-2.3: User Login Workflow** (When Implemented)

#### **Test 2.3.1: Login Form Display**
**URL**: `https://ai-context-service-private.onrender.com/login`

**Test Steps**:
1. Navigate to login page
2. Verify form displays correctly

**Expected Result**:
- ✅ Login form matching design
- ✅ Username and Password fields  
- ✅ "Sign In" button
- ✅ "Don't have account? Create one" link

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending (Not implemented yet)

---

#### **Test 2.3.2: Successful Login**
**Setup**: Use credentials from Test 2.2.3

**Test Steps**:
1. Enter username: `erik-test-2025`
2. Enter password: `testpassword123`
3. Click "Sign In"
4. Verify redirect to dashboard

**Expected Result**:
- ✅ Login successful
- ✅ Redirect to `/dashboard`
- ✅ User session created
- ✅ Welcome message displays

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending (Not implemented yet)

---

### **UAT-2.4: MCP Integration Testing**

#### **Test 2.4.1: New User MCP Endpoint**
**Setup**: After successful signup (Test 2.2.3)

**Claude Desktop Configuration**:
```json
{
  "mcpServers": {
    "ai-context-erik-test": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-stdio", "https://ai-context-service-private.onrender.com/mcp/erik-test-2025"]
    }
  }
}
```

**Test Steps**:
1. Add configuration to Claude Desktop
2. Restart Claude Desktop
3. Test connection

**Expected Result**:
- ✅ Claude connects without errors
- ✅ MCP endpoint responds
- ✅ User isolation working

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 2.4.2: New User Project Creation**
**Setup**: Connected to new user MCP endpoint

**Claude Command**:
```
Use the list_projects tool to see what's available for this new user.
```

**Expected Result**:
- ✅ Shows empty project list
- ✅ Usage guidance displayed
- ✅ No errors or access issues

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 2.4.3: Create First Project for New User**
**Setup**: Connected to new user MCP endpoint

**Claude Command**:
```
Use the create_project tool to create a project called "my-web-signup-test" using the "personal-effectiveness-v1" module.
```

**Expected Result**:
- ✅ Project created successfully
- ✅ Directory structure established
- ✅ User can access project files

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

### **UAT-2.5: Existing Functionality Preservation**

#### **Test 2.5.1: Erik's Existing MCP Endpoint**
**Setup**: Use existing Erik configuration

**Test Steps**:
1. Connect Claude Desktop to `/mcp/erik`
2. Test existing projects and functionality
3. Verify no regression

**Expected Result**:
- ✅ Existing functionality works unchanged
- ✅ All 12 MCP tools working
- ✅ Performance remains optimal
- ✅ No interference from web portal

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

#### **Test 2.5.2: Health Check and API Endpoints**
**Test URLs**:
- `https://ai-context-service-private.onrender.com/health`
- `https://ai-context-service-private.onrender.com/api`

**Expected Result**:
- ✅ Health endpoint returns JSON status
- ✅ API endpoint shows service information
- ✅ Both respond quickly (< 2 seconds)

**Actual Result**: _[Erik to fill in]_

**Status**: ⏳ Pending

---

## 📊 UAT Results Summary

### **Overall Status**: ⏳ Testing in Progress

### **Test Results**:
- **UAT-2.1 (Home Page & Navigation)**: ⏳ 0/3 tests completed
- **UAT-2.2 (User Signup Workflow)**: ⏳ 0/5 tests completed  
- **UAT-2.3 (User Login Workflow)**: ⏳ Not implemented yet
- **UAT-2.4 (MCP Integration)**: ⏳ 0/3 tests completed
- **UAT-2.5 (Existing Functionality)**: ⏳ 0/2 tests completed

### **Critical Issues Found**: 
_[To be documented as testing progresses]_

### **Phase 2 Completion Decision**: 
- ⏳ **Pending** - Awaiting UAT completion
- ❌ **Blocked** - Critical issues must be resolved first
- ✅ **Approved** - Ready for production use

---

## 🚀 Next Steps After UAT 2.2 (Signup)

### **If Signup Tests Pass**:
1. Document any minor issues found
2. Implement login functionality (Workflow 2)
3. Continue with UAT 2.3-2.5

### **If Issues Found**:
1. Document all issues in issues log
2. Categorize: Critical vs. Minor
3. Fix critical issues before proceeding
4. Retest failed scenarios

---

## 📝 Testing Instructions for Erik

### **Testing Order**:
1. **Start with UAT 2.1** - Test home page design and navigation
2. **Move to UAT 2.2** - Test complete signup workflow  
3. **Test MCP integration** - Verify new users can use MCP endpoints
4. **Verify no regressions** - Test existing functionality still works

### **Issue Reporting**:
- Note any visual issues (screenshots helpful)
- Record error messages exactly
- Test edge cases (long usernames, special characters, etc.)
- Try on different browsers if possible

### **Success Criteria**:
- All signup tests pass
- New users can register and use MCP endpoints
- Existing functionality preserved
- Professional UI/UX quality maintained

---

**Testing Notes**: 
When you find issues, just describe them and I'll log them in the issues tracker and fix them immediately. We want the signup flow to be perfect before moving to login!

**Ready to start testing?** Begin with UAT 2.1.1 (Home Page Loading) and work through systematically! 🧪