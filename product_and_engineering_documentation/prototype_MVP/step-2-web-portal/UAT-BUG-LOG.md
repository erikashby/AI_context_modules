# Phase 2 UAT Bug Log

**Date**: July 31, 2025  
**Testing Phase**: Phase 2 Web Portal UAT  
**Tester**: Erik  

## 🐛 Bug #1: Dashboard Active Projects Count Incorrect

**Severity**: High  
**Status**: ✅ **FIXED**  
**Found During**: UAT Testing  
**Fixed**: July 31, 2025  

### **Issue Description**
The dashboard "Active Projects" counter shows `0` instead of displaying the actual number of projects the user has created via MCP.

### **Expected Behavior**
- Dashboard should show the actual count of projects in the user's `/projects/` directory
- Should reflect projects created via MCP tools (e.g., `create_project`)

### **Actual Behavior** 
- Shows `0 Active Projects` regardless of actual projects
- Projects exist in filesystem but not reflected in dashboard

### **Root Cause Analysis**
The dashboard reads project count from `user.projects[]` array in the user profile JSON:

```javascript
// Dashboard displays:
<%= user.projects.length %>

// But user.json contains:
{
  "username": "erikashby", 
  "projects": []  // <- Always empty array
}
```

**Problem**: The `user.projects[]` array in the profile is never updated when projects are created via MCP tools.

### **Technical Details**

**Current Flow:**
1. User creates project via MCP `create_project` tool
2. Project created in filesystem: `/users/{username}/projects/{project-name}/`
3. User profile JSON remains unchanged: `"projects": []`
4. Dashboard reads from profile: `user.projects.length` = 0

**Expected Flow:**
1. User creates project via MCP `create_project` tool  
2. Project created in filesystem: `/users/{username}/projects/{project-name}/`
3. User profile JSON updated: `"projects": ["project-name"]`
4. Dashboard reads from profile: `user.projects.length` = actual count

### **Solution Options**

**Option A: Update Profile on Project Creation**
- Modify `handleCreateProject()` to update user profile
- Add project to `user.projects[]` array when created

**Option B: Dynamic Project Count** 
- Dashboard reads directly from filesystem
- Count projects in `/users/{username}/projects/` directory
- Don't rely on profile array

**Option C: Sync Profile on Dashboard Load**
- Dashboard checks filesystem and syncs profile on each load
- Ensures profile stays current with actual projects

### **Implemented Fix**
**Option A (Dynamic Project Count)** - Dashboard now reads directly from filesystem.

**Implementation Details:**
```javascript
// Dashboard route now counts projects dynamically
const userProjectsDir = path.join(USERS_DIR, req.session.user.username, 'projects');
const projects = await fs.readdir(userProjectsDir, { withFileTypes: true });
const projectCount = projects.filter(item => item.isDirectory()).length;

// Enhanced user object with actual count
const enhancedUser = {
  ...req.session.user,
  actualProjectCount: projectCount
};
```

**Template Updated:**
```html
<!-- Now uses actualProjectCount instead of user.projects.length -->
<%= user.actualProjectCount || 0 %>
```

### **Files Modified**
- ✅ `server-persistent.js` - Added dynamic project counting to dashboard route
- ✅ `views/dashboard.ejs` - Updated to use `actualProjectCount`
- ✅ Added error handling for missing projects directory
- ✅ Added logging for project count verification

### **Verification Tests**
1. ✅ User with existing projects → Dashboard shows correct count
2. ✅ New user with no projects → Dashboard shows 0
3. ✅ Error handling → Graceful fallback to 0 if directory doesn't exist
4. 🔄 **Pending**: Create project via MCP → Verify dashboard updates

---

## 📊 Bug Summary

**Total Bugs Found**: 1  
**High Severity**: 1  
**Medium Severity**: 0  
**Low Severity**: 0  

**Resolution Status**:
- 🔍 **Identified**: 0
- 🔧 **In Progress**: 0  
- ✅ **Fixed**: 1