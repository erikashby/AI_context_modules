# Project Root Folder Structure

## Overview

Each project instance has a three-tier root folder structure that separates system configuration, immutable content, and user-accessible content.

## Root Folder Structure

```
project-name/
├── configuration/          # System-only folder (hidden from user)
├── fixed-content/          # Immutable content templates
└── content/                # User-accessible project content (user's root view)
```

## Folder Definitions

### 1. Configuration Folder
**Path**: `project-name/configuration/`
**Access**: System only - users never see or access this folder
**Purpose**: Contains all system metadata, module configuration, and environment settings

```
configuration/
├── module.json             # Module metadata and configuration
├── project.json            # Project-specific metadata
├── .env                    # Environment variables and API keys
├── permissions.json        # User roles and access controls
├── ai-instructions/        # AI behavior configuration
│   ├── behavior-rules.md
│   ├── context-priorities.md
│   └── navigation-guide.md
└── system/                 # System-level configuration
    ├── sync-rules.json     # Rules for fixed-content replication
    ├── validation.json     # Content validation rules
    └── integrations.json   # External system connections
```

### 2. Fixed Content Folder
**Path**: `project-name/fixed-content/`
**Access**: System managed - contains the immutable templates
**Purpose**: Master copies of content that must remain unchanged

```
fixed-content/
├── README.md               # Project overview and instructions
├── ai-instructions/        # AI guidance files
│   ├── project-context.md
│   └── working-guidelines.md
├── templates/              # File and folder templates
│   ├── task-template.md
│   ├── meeting-notes.md
│   └── decision-log.md
└── guides/                 # Reference materials
    ├── getting-started.md
    ├── best-practices.md
    └── troubleshooting.md
```

### 3. Content Folder (User Root)
**Path**: `project-name/content/`
**Access**: User's primary workspace - this is their "root" view
**Purpose**: Main working area containing both user-editable and replicated fixed content

```
content/                    # This is what the user sees as their project root
├── README.md               # PRE-EXISTING (developer provided, user can modify)
├── ai-instructions/        # Mixed folder
│   ├── project-context.md      # PRE-EXISTING (developer provided, user can modify)
│   ├── my-custom-rules.md      # NEW CONTENT (user-created)
│   └── domain-specific.md      # NEW CONTENT (user-created)
├── templates/              # Mixed folder
│   ├── daily-note-template.md  # PRE-EXISTING (developer provided, user can modify)
│   ├── meeting-template.md     # PRE-EXISTING (developer provided, user can modify)
│   ├── my-project-template.md  # NEW CONTENT (user-created)
│   └── custom-checklist.md     # NEW CONTENT (user-created)
├── guides/                 # Mixed folder
│   ├── getting-started.md      # PRE-EXISTING (developer provided, user can modify)
│   ├── my-workflow.md          # NEW CONTENT (user-created)
│   └── team-processes.md       # NEW CONTENT (user-created)
├── planning/               # User folder: folder structure may be FIXED for AI navigation
│   ├── daily/                  # FIXED FOLDER (AI trained to find daily notes here)
│   │   ├── 2025-01-14.md          # NEW CONTENT (daily note)
│   │   └── 2025-01-15.md          # NEW CONTENT (daily note)
│   ├── weekly/                 # FIXED FOLDER (AI trained to find weekly reviews here)
│   │   └── week-03-2025.md       # NEW CONTENT (weekly review)
│   └── monthly/                # FIXED FOLDER (AI trained to find monthly planning here)
│       └── january-2025.md        # NEW CONTENT (monthly plan)
├── context/                # User folder: all content editable
│   ├── goals.md                # PRE-EXISTING (developer provided, user can modify)
│   ├── priorities.md           # PRE-EXISTING (developer provided, user can modify)
│   └── preferences.json        # PRE-EXISTING (developer provided, user can modify)
├── tasks/                  # User folder: all content editable
│   ├── active/
│   ├── completed/
│   └── someday-maybe/
└── resources/              # User folder: all content editable
    ├── documents/
    └── links/
```

## Content Types

There are three types of content in the system:

### 1. Fixed Content (Rare - Use Sparingly)
**Purpose**: Critical files that must remain unchanged for AI optimization or system functionality
**Location**: Replicated from `fixed-content/` to `content/` as read-only files
**Examples**: 
- Folder structures that AI agents are trained to navigate
- Template formats that AI agents are optimized to understand
- System configuration files that ensure proper operation

### 2. Pre-Existing Content (Common - Developer Provided)
**Purpose**: Content created by module developers that users can modify to fit their needs
**Location**: Created directly in `content/` during project initialization
**Examples**:
- Template files that users can customize
- Example documents showing best practices
- Starter configurations that users can adapt

### 3. New Content (User Created)
**Purpose**: Content created by users during normal project usage
**Location**: Created by users in `content/` folders
**Examples**:
- Daily notes and logs
- User-specific documents
- Custom templates and workflows

### File-Level Replication
The system maintains synchronization at the **file level**, not folder level. This means:

- **Mixed Folders**: A single folder can contain both fixed files (read-only) and user files (editable)
- **Fixed Files**: Specific files replicated from fixed-content that cannot be modified
## Practical Example: Daily Planning Module

Here's how the three content types work together in a Daily Planning module:

### Fixed Content (Rare - Strategic Use)
- **Folder Structure**: `planning/daily/`, `planning/weekly/`, `planning/monthly/`
  - **Why Fixed**: AI agents are trained to look for daily notes in the `daily/` folder, weekly reviews in `weekly/`, etc.
  - **Benefit**: Consistent navigation patterns across all planning projects

### Pre-Existing Content (Common - Developer Provided)
- **Daily Note Template**: `templates/daily-note-template.md`
  - **Purpose**: Provides a starting structure for daily notes
  - **User Flexibility**: Users can modify the template to match their style
  - **Example**: Developer provides sections for goals, tasks, and reflections

- **Getting Started Guide**: `guides/getting-started.md`
  - **Purpose**: Explains how to use the planning system
  - **User Flexibility**: Users can add their own tips and customize instructions

### New Content (User Created)
- **Daily Notes**: `planning/daily/2025-01-14.md`, `planning/daily/2025-01-15.md`
  - **Purpose**: Actual daily planning entries
  - **Creation**: User creates these using the template or their own format
  - **Ownership**: Fully user-controlled and editable

This approach ensures:
- **AI Effectiveness**: Agents know where to find specific types of content
- **User Freedom**: Users can customize templates and processes to their needs
- **Consistency**: Critical navigation patterns remain stable across projects

### Fixed File Behavior
1. **Creation**: Fixed files are replicated from fixed-content during project creation
2. **Protection**: Users receive an error if they attempt to modify fixed files directly
3. **Monitoring**: System continuously monitors for changes to fixed files
4. **Auto-Restoration**: Any external modifications to fixed files are automatically overwritten
5. **Replication**: Changes to fixed-content are automatically pushed to all project instances

### User File Behavior
1. **Creation**: Users can create new files in any folder
2. **Editing**: User-created files are fully editable
3. **Naming**: User files must not conflict with fixed file names
4. **Persistence**: User files are preserved during system updates
5. **Sync**: User files participate in external sync operations

### Replication Rules
Stored in `configuration/system/sync-rules.json`:

```json
{
  "replication_rules": [
    {
      "source": "fixed-content/README.md",
      "target": "content/README.md",
      "read_only": true
    },
    {
      "source": "fixed-content/ai-instructions/project-context.md",
      "target": "content/ai-instructions/project-context.md",
      "read_only": true
    },
    {
      "source": "fixed-content/ai-instructions/working-guidelines.md",
      "target": "content/ai-instructions/working-guidelines.md",
      "read_only": true
    },
    {
      "source": "fixed-content/templates/task-template.md",
      "target": "content/templates/task-template.md",
      "read_only": true
    },
    {
      "source": "fixed-content/templates/meeting-notes.md",
      "target": "content/templates/meeting-notes.md",
      "read_only": true
    },
    {
      "source": "fixed-content/templates/decision-log.md",
      "target": "content/templates/decision-log.md",
      "read_only": true
    },
    {
      "source": "fixed-content/guides/getting-started.md",
      "target": "content/guides/getting-started.md",
      "read_only": true
    },
    {
      "source": "fixed-content/guides/best-practices.md",
      "target": "content/guides/best-practices.md",
      "read_only": true
    },
    {
      "source": "fixed-content/guides/troubleshooting.md",
      "target": "content/guides/troubleshooting.md",
      "read_only": true
    }
  ],
  "sync_behavior": {
    "replication_level": "file",
    "monitor_changes": true,
    "auto_restore_read_only": true,
    "sync_frequency": "real-time",
    "enable_external_sync": true,
    "user_file_creation_allowed": true
  }
}
```

## User Experience

### What Users See
Users only see the `content/` folder as their project root. To them, the project structure looks like:

```
My Project/                 # This is actually content/ folder
├── README.md               # Read-only (replicated)
├── context/                # User-editable
├── tasks/                  # User-editable
├── planning/               # User-editable
├── resources/              # Mixed (some read-only, some editable)
└── ai-instructions/        # Read-only (replicated)
```

### Read-Only Indicators
- Read-only files could be marked with special attributes or naming conventions
- System could provide visual indicators in file browsers
- Attempting to edit read-only content shows informative messages

## Benefits

### System Benefits
- **Security**: Sensitive configuration isolated from user access
- **Integrity**: Critical content cannot be accidentally modified
- **Consistency**: All projects maintain required structure and content
- **Maintainability**: System can update fixed content across all projects

### User Benefits  
- **Clean Interface**: Users see only what they need to work with
- **Protection**: Cannot accidentally break system-critical files
- **Guidance**: Always have access to up-to-date templates and guides
- **Simplicity**: Clear distinction between what they can and cannot modify

### AI Benefits
- **Reliable Structure**: Can always find system files in predictable locations
- **Current Instructions**: AI guidance always reflects latest module version
- **Clear Boundaries**: Knows which content is user-generated vs system-provided
- **Rich Context**: Has access to both configuration and user content for decision-making

## Technical Implementation

### File System Monitoring
```python
def monitor_content_folder(project_path):
    """Monitor content folder for changes to read-only files"""
    content_path = f"{project_path}/content/"
    fixed_content_path = f"{project_path}/fixed-content/"
    
    # Watch for file changes
    for change in watch_directory(content_path):
        if is_read_only_file(change.path):
            restore_from_fixed_content(change.path, fixed_content_path)
            notify_user_of_reversion(change.path)
```

### Project Initialization
```python
def initialize_project_structure(project_path, module_path):
    """Create the three-tier folder structure"""
    
    # 1. Copy configuration from module
    copy_tree(f"{module_path}/configuration/", f"{project_path}/configuration/")
    
    # 2. Copy fixed content from module  
    copy_tree(f"{module_path}/fixed-content/", f"{project_path}/fixed-content/")
    
    # 3. Create content folder structure
    create_content_structure(project_path, module_path)
    
    # 4. Replicate fixed content to content folder
    replicate_fixed_content(project_path)
    
    # 5. Start monitoring system
    start_content_monitor(project_path)
```
