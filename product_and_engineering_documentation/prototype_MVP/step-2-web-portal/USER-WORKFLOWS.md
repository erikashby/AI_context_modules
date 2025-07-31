# Phase 2 Web Portal - User Workflows
**Date**: July 30, 2025  
**Status**: Agreed and Ready for Implementation  
**Architecture**: Single-Server Integration  

## 🎯 Core Workflows

### **Workflow 1: User Signup**

```
Home Page → Signup Form → User Provisioning → Success/Redirect
```

#### **Step-by-Step Flow**:

1. **User starts on home page** 
   - Route: `/` or `/home`
   - Page displays landing content with "Get Started" CTA
   - Clean, professional design matching Lovable prototype

2. **User selects signup**
   - Click "Get Started" or "Sign Up" button
   - Navigate to: `/signup`
   - Display signup form

3. **User fills out signup fields**
   - **Full Name**: Display name for user
   - **Email**: Contact email (validation required)
   - **Username**: Critical field - becomes MCP endpoint username
   - **Password**: Secure password (validation required)
   - **Confirm Password**: Password confirmation

4. **User hits Submit**
   - Form validation (client-side and server-side)
   - POST to `/signup` endpoint
   - Server processing begins

5. **Backend User Provisioning** (Critical Integration Point)
   - **Create user directory structure**:
     ```
     users/{username}/
     ├── profile/
     │   └── user.json (contains: name, email, password hash, created date)
     └── projects/
         └── (empty initially)
     ```
   - **Password storage**: Hash password securely (bcrypt)
   - **User validation**: Ensure username is unique, valid format
   - **Integration**: Use existing user creation patterns from CLI tool

6. **Success Response**
   - User account created successfully
   - Redirect to login page with success message
   - Or auto-login and redirect to dashboard

---

### **Workflow 2: User Login**

```
Login Page → Authentication → Dashboard
```

#### **Step-by-Step Flow**:

1. **User starts on login page**
   - Route: `/login`  
   - Display login form
   - Links to signup for new users

2. **User selects login**
   - Already on login page, focus on form

3. **User fills out credentials**
   - **Username**: Same username used for MCP endpoint
   - **Password**: User's password

4. **User hits Submit**
   - Form validation
   - POST to `/login` endpoint
   - Server authentication

5. **Backend Authentication**
   - **Validate user exists**: Check `users/{username}/profile/user.json` exists
   - **Password verification**: Compare hashed password
   - **Session creation**: Create secure session
   - **Session storage**: Store user session data

6. **Dashboard Redirect**
   - Route: `/dashboard`
   - Display personalized dashboard
   - Show user is logged in (name, profile info)
   - Display user account details

---

## 🔧 Technical Implementation Details

### **Database/Storage Integration**
- **Reuse existing architecture**: `users/` directory structure from Phase 1
- **User profile format**:
  ```json
  {
    "username": "johndoe",
    "fullName": "John Doe", 
    "email": "john@example.com",
    "passwordHash": "$2b$10$...",
    "created": "2025-07-30T10:00:00.000Z",
    "lastLogin": "2025-07-30T10:00:00.000Z"
  }
  ```

### **Security Requirements**
- **Password hashing**: bcrypt with salt rounds
- **Session management**: Secure HTTP-only cookies
- **Input validation**: Sanitize all user inputs
- **Username validation**: Alphanumeric + dash/underscore only (for MCP URL safety)

### **Error Handling**
- **Signup errors**: Username taken, invalid email, password mismatch
- **Login errors**: User not found, invalid password
- **User-friendly messages**: Clear error feedback

### **Success States**
- **Signup success**: "Account created successfully! Please log in."
- **Login success**: Redirect to dashboard with welcome message
- **Session persistence**: Remember login across browser sessions

---

## 🎨 UI/UX Design Requirements

### **Design Consistency**
- **Match Lovable prototype**: Dark theme, purple branding, clean forms
- **Responsive design**: Mobile and desktop friendly
- **Professional appearance**: Match existing MCP service quality

### **Form Design**
- **Clear labeling**: Required fields marked with asterisks
- **Validation feedback**: Real-time field validation
- **Loading states**: Show processing during submit
- **Error states**: Clear error messaging

### **Navigation Flow**
- **Intuitive routing**: Clear paths between pages
- **Breadcrumbs**: Users know where they are
- **Session handling**: Proper logout and session expiry

---

## 🚀 Implementation Priority

### **Phase 2A: Foundation** (Days 1-2)
1. Add template engine to existing server
2. Create basic layout matching Lovable design
3. Set up CSS framework (Tailwind)
4. Create static home page

### **Phase 2B: Workflow 1 - Signup** (Days 3-4)
1. Build signup form and page
2. Implement user provisioning backend
3. Integrate with existing user directory structure
4. Add form validation and error handling

### **Phase 2C: Workflow 2 - Login** (Days 5-6)
1. Build login form and page
2. Implement authentication system
3. Create session management
4. Build basic dashboard page

### **Phase 2D: Polish & Testing** (Day 7)
1. End-to-end workflow testing
2. Error handling refinement
3. UI/UX polish
4. Integration with existing MCP functionality

---

## ✅ Success Criteria

### **Workflow 1 Success**:
- [ ] User can access clean, professional home page
- [ ] Signup form matches Lovable design quality
- [ ] Form validation works properly
- [ ] User directory structure created correctly
- [ ] Password stored securely
- [ ] Success/error messages display clearly

### **Workflow 2 Success**:
- [ ] Login form is clean and intuitive
- [ ] Authentication works with created users
- [ ] Sessions persist properly
- [ ] Dashboard shows user is logged in
- [ ] User profile information displays correctly

### **Integration Success**:
- [ ] New users can be created from web interface
- [ ] User data integrates with existing MCP architecture
- [ ] No disruption to existing MCP functionality
- [ ] Username becomes valid MCP endpoint (`/mcp/{username}`)

---

**Status**: ✅ **APPROVED** - Ready for implementation

**Next Step**: Begin Phase 2A foundation development