# MCP Authentication Implementation

**Date**: July 31, 2025  
**Status**: Implementation Ready  
**Priority**: High Security

## 🎯 Overview

Implement secure API key authentication for MCP endpoints to prevent unauthorized access and enable proper user isolation.

## 🏗️ Architecture Design

### **URL Structure Change**
```
Before: /mcp/{username}
After:  /mcp/{username}/{key}
```

### **Authentication Flow**
```
1. User signs up → Generate 16-char UUID key
2. Key stored in user profile JSON
3. Dashboard displays masked key + copy functionality  
4. Claude Desktop uses: /mcp/username/key-here
5. Server validates key before MCP processing
6. Invalid key → 401 Unauthorized
```

## 🔧 Technical Implementation

### **1. Key Generation**
```javascript
function generateMCPKey() {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  // Example: "a1b2c3d4e5f6g7h8"
}
```

### **2. User Profile Schema Update**
```json
{
  "username": "erik",
  "fullName": "Erik User", 
  "email": "erik@example.com",
  "passwordHash": "$2b$12$...",
  "mcpKey": "a1b2c3d4e5f6g7h8",
  "created": "2025-07-31T12:00:00.000Z",
  "lastLogin": "2025-07-31T12:00:00.000Z",
  "projects": []
}
```

### **3. Route Handler Update**
```javascript
// OLD: app.all('/mcp/:username?', ...)
// NEW: 
app.all('/mcp/:username/:key', async (req, res) => {
  const { username, key } = req.params;
  
  // Validate authentication
  if (!await validateUserMCPKey(username, key)) {
    return res.status(401).json({
      error: 'Invalid authentication credentials',
      message: 'Check your MCP endpoint URL and key'
    });
  }
  
  // Continue with existing MCP logic...
  console.log(`Authenticated MCP request for user: ${username}`);
  // ... existing MCP processing ...
});
```

### **4. Key Validation Function**
```javascript
async function validateUserMCPKey(username, providedKey) {
  try {
    if (!username || !providedKey) return false;
    
    const userProfile = await getUserProfile(username);
    if (!userProfile || !userProfile.mcpKey) return false;
    
    return userProfile.mcpKey === providedKey;
  } catch (error) {
    console.error('MCP key validation error:', error);
    return false;
  }
}
```

### **5. Dashboard Key Management**
```javascript
// Dashboard route enhancement
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  
  const user = req.session.user;
  const maskedKey = user.mcpKey ? 
    user.mcpKey.substring(0, 4) + '...' + user.mcpKey.substring(-4) : 
    'Not generated';
    
  res.render('dashboard', {
    title: 'Dashboard - AI Context Service',
    user: user,
    mcpEndpoint: `/mcp/${user.username}/${user.mcpKey}`,
    maskedKey: maskedKey
  });
});

// Key regeneration endpoint
app.post('/dashboard/regenerate-key', async (req, res) => {
  if (!req.session.user) return res.status(401).json({error: 'Not authenticated'});
  
  const username = req.session.user.username;
  const newKey = generateMCPKey();
  
  // Update user profile
  const userProfile = await getUserProfile(username);
  userProfile.mcpKey = newKey;
  
  const profilePath = path.join(USERS_DIR, username, 'profile', 'user.json');
  await fs.writeFile(profilePath, JSON.stringify(userProfile, null, 2), 'utf8');
  
  // Update session
  req.session.user.mcpKey = newKey;
  
  res.json({
    success: true,
    newKey: newKey,
    mcpEndpoint: `/mcp/${username}/${newKey}`
  });
});
```

## 🎨 Dashboard UI Updates

### **MCP Configuration Section**
```html
<div class="mcp-config-section">
  <h3>Your MCP Configuration</h3>
  
  <div class="key-display">
    <label>API Key:</label>
    <code id="masked-key">abc1...xyz9</code>
    <button onclick="toggleKeyVisibility()">Show/Hide</button>
    <button onclick="regenerateKey()">Regenerate</button>
  </div>
  
  <div class="endpoint-display">
    <label>MCP Endpoint:</label>
    <code id="mcp-endpoint">/mcp/username/key-here</code>
    <button onclick="copyConfiguration()">Copy Claude Config</button>
  </div>
  
  <div class="claude-config">
    <label>Claude Desktop Configuration:</label>
    <pre id="claude-config-json">{
  "mcpServers": {
    "ai-context-username": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-stdio", 
               "https://ai-context-service-private.onrender.com/mcp/username/key"]
    }
  }
}</pre>
    <button onclick="copyToClipboard('claude-config-json')">Copy Config</button>
  </div>
</div>
```

## 🔒 Security Considerations

### **Key Security**
- **16 characters**: Sufficient entropy (2^64 combinations)
- **UUID-based**: Cryptographically secure random generation
- **No transmission**: Keys only in URLs, not headers/body
- **Server-side validation**: No client-side key exposure

### **Attack Prevention**
- **Brute force**: 16-char random key = computationally infeasible
- **Key rotation**: Users can regenerate keys anytime
- **Access logging**: Failed attempts logged for monitoring
- **Isolation**: Key validates user, existing directory isolation prevents cross-user access

## 📋 Migration Strategy

### **Existing Users**
1. **Key Generation**: Generate keys for existing users on first profile access
2. **Profile Update**: Add `mcpKey` field to existing user.json files
3. **Claude Desktop**: Users update configurations with new URLs

### **New Users**
1. **Signup**: Generate key during user creation
2. **Dashboard**: Display key immediately after signup
3. **Onboarding**: Guide users through Claude Desktop setup

## 🧪 Testing Plan

### **Authentication Tests**
1. **Valid key**: MCP request succeeds
2. **Invalid key**: Returns 401 Unauthorized  
3. **Missing key**: Returns 401 Unauthorized
4. **Wrong user**: Key for user A doesn't work for user B
5. **Key regeneration**: Old key stops working, new key works

### **Dashboard Tests**
1. **Key display**: Shows masked key correctly
2. **Key regeneration**: Updates key and session
3. **Configuration copy**: Generates correct Claude Desktop config
4. **Error handling**: Graceful failure for key operations

## 🚀 Deployment Plan

### **Phase 1: Server Implementation**
1. Update route handler with key validation
2. Add key generation to user creation
3. Update existing user profiles with keys
4. Deploy authentication system

### **Phase 2: Dashboard Enhancement**  
1. Add key management UI to dashboard
2. Implement key regeneration endpoint
3. Add Claude Desktop configuration helper
4. Test end-to-end workflow

### **Phase 3: Documentation & Support**
1. Update user onboarding flow
2. Create troubleshooting guide
3. Monitor authentication errors
4. Gather user feedback

## ✅ Success Criteria

- **Security**: All MCP endpoints require valid authentication
- **Usability**: Users can easily manage keys in dashboard
- **Compatibility**: Existing Claude Desktop setups work with new URLs
- **Performance**: Key validation adds <10ms to MCP requests
- **Reliability**: 99.9% authentication success rate for valid requests

---

**Ready for implementation!** All requirements confirmed and documented.