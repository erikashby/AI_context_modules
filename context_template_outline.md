# Context Template (Module) Creation Outline

## AI Context Service Module Architecture

### Vision
Transform AI assistants from reactive tools into intelligent partners through structured, persistent context intelligence.

## Module System Structure

### Two-Tier Architecture
- **Modules**: Templates/blueprints for specific domains (D&D, Personal Effectiveness, etc.)
- **Projects**: Live instances created from modules containing user data

### Three-Tier Folder Structure
```
module-name/
├── configuration/          # System configuration (hidden from users)
│   └── module.json         # Module metadata and settings
├── protected-files/        # Author-protected file backups (invisible to users and AI)
│   └── README.md          # Explains author protection purpose for administrators
└── content/               # User's complete editable workspace
    ├── README.md          # User workspace documentation
    ├── ai-instructions/   # AI context and guidance files (user editable)
    ├── templates/         # Reusable templates and patterns (user editable)
    ├── guides/           # Reference documentation (user accessible)
    └── domain-folders/    # Domain-specific user content
```

## Module Creation Requirements

### Essential Components

#### 1. Module Configuration (`configuration/module.json`)
```json
{
  "module": {
    "id": "unique-module-identifier",
    "name": "Human-readable Module Name",
    "version": "1.0.0",
    "description": "Brief description of module purpose",
    "created": "2025-08-10",
    "updated": "2025-08-10"
  },
  "structure": {
    "folder_name": "Description of folder purpose",
    "another_folder": "Description of another folder"
  },
  "features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ]
}
```

#### 2. AI Instructions (`content/ai-instructions/project-context.md`)
Must include:
- **Project Overview**: Clear description of the domain/use case
- **Communication Preferences**: How to work with users in this domain
- **Context Navigation**: Which folders to check for current context
- **AI Assistant Guidelines**: Domain-specific rules and behaviors
- **Error Prevention**: What to do when information is missing

#### 3. User Workspace (`content/README.md`)
- Getting started instructions
- Workspace structure explanation
- AI assistant feature overview
- Help and guidance references

#### 4. Domain-Specific Structure
Create folders that serve the specific domain, such as:
- Planning-focused: `current-status/`, `goals/`, `planning/`
- Creative: `projects/`, `inspiration/`, `drafts/`
- Learning: `courses/`, `notes/`, `practice/`
- Health: `appointments/`, `tracking/`, `goals/`

## Existing Module Analysis

### D&D Character Development Module
- **Domain**: Role-playing game character creation and management
- **Key Features**: Step-by-step character creation, D&D 5E rules reference, character sheet templates
- **AI Behavior**: Explicit approval gates, thorough rule referencing, structured workflows
- **Structure**: `characters/`, `campaigns/`, `guides/` with comprehensive D&D 5E reference materials

### Personal Effectiveness Module
- **Domain**: Productivity optimization and personal intelligence
- **Key Features**: Time optimization, decision support, personal pattern tracking, hierarchical planning
- **AI Behavior**: Direct and actionable, specific recommendations, overwhelm management
- **Structure**: `current-status/`, `goals/`, `planning/`, `insights/` with effectiveness pattern templates

## Module Creation Process

### 1. Define Domain and Use Case
- What specific problem does this solve?
- Who is the target user?
- What are the core workflows?

### 2. Design Folder Structure
- What content will users create?
- How should AI navigate the information?
- What templates and guides are needed?

### 3. Create AI Instructions
- How should AI communicate in this domain?
- What context is most important?
- What are the domain-specific rules?

### 4. Build Content Framework
- Essential templates for user workflows
- Reference materials and guides
- Starting content and examples

### 5. Configure Module Metadata
- Complete module.json with all features
- Document folder purposes
- Define version and update strategy

## Key Design Principles

1. **AI-Optimized Navigation**: Consistent folder structures AI can reliably navigate
2. **User-Editable Everything**: All content in workspace should be customizable
3. **Rich Context**: Provide comprehensive templates and reference materials
4. **Domain Expertise**: AI instructions should reflect best practices for the domain
5. **Scalable Structure**: Support growth from simple to complex use cases

## Template Patterns

### Communication Preferences
- Direct vs detailed explanations
- Approval gates vs autonomous action
- Collaborative vs individual workflows
- Structured vs flexible approaches

### Context Navigation Priority
1. Immediate status/priorities
2. Current active work
3. Goals and objectives  
4. Reference materials and templates

### Content Types
- **Templates**: Reusable patterns and frameworks
- **Guides**: Reference materials and best practices
- **Examples**: Sample content showing proper usage
- **Workflows**: Step-by-step processes for common tasks

## Deployment Process

1. Create module folder in `/home/erikashby/github/AI_context_modules/`
2. Build three-tier structure with all required components
3. Test with sample user workflows
4. Document in module README
5. Submit for integration with AI Context Service

---

*This outline serves as a comprehensive guide for creating new context templates (modules) for the AI Context Service ecosystem.*