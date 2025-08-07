# Module System Architecture

## Overview

The Module System uses **physical folder templates** that mirror the actual project structure. Each module is a complete folder hierarchy that serves as a "seed" - when a new project is created, the module's folder structure is copied to create the project's filesystem layout.

This approach makes modules tangible, portable (as zip files), and directly translatable to working project environments.

## Module as Folder Structure

### Physical Module Layout

Each module exists as a three-tier folder structure that defines the complete project template:

```
personal-planning-module/
├── configuration/              # System configuration templates
│   ├── module.json            # Module metadata and configuration
│   ├── project-template.json  # Project-specific settings template
│   ├── .env.template          # Environment variables template
│   ├── permissions.json       # Default roles and permissions
│   ├── ai-system-instructions/       # System wide AI behavior configuration
│   │   ├── behavior-rules.md
│   │   ├── context-priorities.md
│   │   └── navigation-guide.md
│   ├── services and tools     # Connected Services and availbe tools
│   └── system/                # System-level configuration
│       ├── sync-rules.json    # Fixed content replication rules
│       └── validation.json    # Content validation rules
├── fixed-content/             # Immutable content templates
│   ├── README.md              # Project overview template
│   ├── ai-instructions/       # AI guidance for users
│   │   ├── project-context.md
│   │   └── working-guidelines.md
│   ├── templates/             # File templates
│   │   ├── goal-template.md
│   │   ├── task-template.md
│   │   └── meeting-notes.md
│   └── guides/                # Reference materials
│       ├── getting-started.md
│       └── best-practices.md
└── content-structure/         # User content folder template (complete replica of fixed-content + user areas)
    ├── README.md              # Replica of fixed-content/README.md (read-only)
    ├── ai-instructions/       # Replica of fixed-content/ai-instructions/ (read-only)
    │   ├── project-context.md
    │   └── working-guidelines.md
    ├── templates/             # Replica of fixed-content/templates/ (read-only)
    │   ├── goal-template.md
    │   ├── task-template.md
    │   └── meeting-notes.md
    ├── guides/                # Replica of fixed-content/guides/ (read-only)
    │   ├── getting-started.md
    │   └── best-practices.md
    ├── context/               # User-editable context area
    │   ├── goals.md
    │   ├── priorities.md
    │   └── preferences.json
    ├── tasks/                 # User-editable task management
    │   ├── active/
    │   ├── completed/
    │   └── someday-maybe/
    ├── planning/              # User-editable planning documents
    │   ├── weekly/
    │   ├── monthly/
    │   └── annual/
    └── resources/             # User-editable resources
        ├── documents/
        └── links/
```

### Module Metadata (module.json)

The `module.json` file contains all the configuration and metadata:

```json
{
  "module": {
    "id": "personal-planning-v1",
    "name": "Personal Planning",
    "version": "1.0.0",
    "description": "Personal task management and goal tracking",
    "category": "productivity",
    "author": "AI Context Service",
    "created": "2025-01-01",
    "updated": "2025-01-01"
  },
  "project_config": {
    "required_folders": ["context", "tasks", "planning"],
    "optional_folders": ["resources", "archive"],
    "default_files": {
      "README.md": "project-readme-template.md",
      "context/goals.md": "goals-template.md"
    }
  },
  "ai_instructions": {
    "primary_focus": "actionable planning and realistic scheduling",
    "context_priority": ["context/goals.md", "context/priorities.md", "tasks/active/"],
    "folder_navigation_rules": "Always check context/ first, then tasks/active/ for current state"
  },
  "roles": [
    {
      "name": "planner",
      "permissions": ["read", "write", "schedule"],
      "folder_access": ["all"]
    },
    {
      "name": "reviewer", 
      "permissions": ["read", "comment"],
      "folder_access": ["context", "planning", "tasks/completed"]
    }
  ]
}
```

## Module Deployment and Usage

### Module Distribution
1. **Zip Archive**: Modules can be packaged as zip files containing the complete folder structure
2. **Version Control**: Modules can be stored in git repositories for version tracking
3. **Module Registry**: Central registry of available modules for discovery

### Project Creation Process
```
1. User selects module (e.g., "Personal Planning")
2. System locates module folder/zip
3. Three-tier project structure is created:
   a. Copy configuration/ to project/configuration/
   b. Copy fixed-content/ to project/fixed-content/
   c. Copy content-structure/ to project/content/
4. Template files are processed (variable substitution, etc.)
5. Fixed content is replicated to appropriate locations in content/
6. Content monitoring system is initialized
7. Project becomes independent working environment
```

### Example Project Creation
```bash
# Module location
/modules/personal-planning-v1/

# New project creation
cp -r /modules/personal-planning-v1/ /projects/my-2025-planning/
# Process templates and customize for user
# Project ready for use
```

## Module Structure Patterns

### Standard Folder Conventions

All modules should follow these conventions for AI navigation:

#### Required Folders
- **`context/`**: Core context data and user preferences
- **`README.md`**: Project overview and current status
- **`ai_instructions/`**: AI-specific guidance and behavior rules

#### Common Folders
- **`tasks/`**: Task management and tracking
- **`planning/`**: Strategic planning and reviews
- **`resources/`**: Reference materials and templates
- **`archive/`**: Completed or historical items
- **`collaboration/`**: Shared materials and communication

#### Module-Specific Folders
Different modules can add domain-specific folders:
- **Health Module**: `appointments/`, `medications/`, `health-data/`
- **Work Project Module**: `meetings/`, `deliverables/`, `team/`
- **Financial Module**: `budgets/`, `investments/`, `transactions/`

## Template Processing

### File Templates
Module files can contain template variables that get processed during project creation:

```markdown
# Welcome to {{PROJECT_NAME}}

Created: {{CREATION_DATE}}
Module: {{MODULE_NAME}} v{{MODULE_VERSION}}
Owner: {{USER_NAME}}

## Getting Started
This project is based on the {{MODULE_NAME}} module...
```

### Dynamic Content
Some files may be generated based on module configuration:
- AI instruction files customized for user preferences
- Default context files with user-specific information
- Folder structures adapted based on selected options

## Benefits of Filesystem-Based Modules

### For Users
- **Visual Understanding**: Can see exactly what they'll get
- **Easy Customization**: Can modify module templates before deployment
- **Familiar Structure**: Uses standard file/folder organization
- **Portable**: Modules can be shared as simple zip files

### For AI Assistants
- **Logical Navigation**: Clear folder hierarchy for context discovery
- **Consistent Structure**: Same patterns across all projects of a type
- **Rich Context**: Full file structure provides navigation cues
- **Efficient Access**: Can quickly locate relevant information

### For Developers
- **Simple Implementation**: Standard file operations for project creation
- **Version Control**: Easy to track module changes over time
- **Testing**: Can validate modules by examining folder structure
- **Distribution**: Standard packaging and deployment mechanisms

## Module Examples

### Personal Planning Module Structure
```
personal-planning-v1/
├── module.json
├── README.md
├── context/
│   ├── goals.md
│   ├── priorities.md
│   ├── time-preferences.json
│   └── working-style.md
├── tasks/
│   ├── active/
│   ├── completed/
│   ├── someday-maybe/
│   └── templates/
├── planning/
│   ├── daily/
│   ├── weekly/
│   ├── monthly/
│   └── annual/
└── ai_instructions/
    ├── planning-agent-rules.md
    └── task-management-guide.md
```

### Health Module Structure
```
health-v1/
├── module.json
├── README.md
├── context/
│   ├── health-profile.md
│   ├── goals.md
│   └── preferences.json
├── appointments/
│   ├── upcoming/
│   ├── history/
│   └── providers/
├── medications/
│   ├── current/
│   ├── history/
│   └── reminders/
├── health-data/
│   ├── vitals/
│   ├── symptoms/
│   └── tracking/
└── ai_instructions/
    ├── health-assistant-rules.md
    └── privacy-guidelines.md
```

## Technical Implementation

### Module Storage
- **Local Modules**: Stored in `/modules/` directory
- **Remote Modules**: Downloaded from module registry
- **User Modules**: Custom modules created by users

### Project Instantiation
```python
def create_project_from_module(module_id, project_name, user_id):
    # 1. Locate module
    module_path = f"/modules/{module_id}/"
    
    # 2. Copy module structure
    project_path = f"/projects/{user_id}/{project_name}/"
    copy_tree(module_path, project_path)
    
    # 3. Process templates
    process_template_files(project_path, {
        'PROJECT_NAME': project_name,
        'USER_ID': user_id,
        'CREATION_DATE': datetime.now()
    })
    
    # 4. Initialize project metadata
    initialize_project(project_path)
    
    return project_path
```

### Module Validation
- **Structure Validation**: Ensure required folders and files exist
- **Metadata Validation**: Validate module.json schema
- **AI Instruction Validation**: Ensure AI guidance files are present
- **Template Validation**: Check template file syntax

## Future Enhancements

### Module Marketplace
- Community-contributed modules
- Module ratings and reviews
- Automatic updates and version management

### Advanced Template Features
- Conditional folder creation based on user preferences
- Dynamic content generation
- Module composition (combining multiple modules)

### Development Tools
- Module creation wizard
- Module testing framework
- Module documentation generator
