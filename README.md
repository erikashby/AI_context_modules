# AI Context Service - Project Modules

This repository contains project templates (modules) for the AI Context Service. These templates provide pre-structured project frameworks with AI guidance and domain-specific workflows.

## Overview

Project modules are structured templates that users can use to create new projects in their AI Context Service workspace. Each module includes:

- **AI Instructions** - Context-specific guidance for AI assistants
- **Content Structure** - Organized folders and templates
- **Documentation** - Usage guides and examples
- **Metadata** - Module configuration and feature definitions

## Available Modules

### 1. D&D Character Development (`dnd-character-development`)
Complete D&D 5E character creation and management system with AI-guided workflows.

**Features:**
- Step-by-step character creation with AI guidance
- Complete D&D 5E rules reference database
- Character sheet templates and management
- Spell database with class-specific lists
- Campaign and character progression tracking

**Best for:** RPG players, dungeon masters, character development

### 2. Personal Effectiveness (`personal-effectiveness-v1`)
Personal productivity optimization and intelligence system.

**Features:**
- Intelligent daily and weekly planning
- Dynamic time optimization
- Overwhelm management
- Personal effectiveness pattern tracking
- Context-aware goal setting

**Best for:** Personal productivity, time management, effectiveness optimization

## Module Structure

Each module follows the three-tier architecture:

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

## Module Configuration (`module.json`)

Each module must include a `module.json` file with this structure:

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

## Usage in AI Context Service

These modules are automatically deployed to the AI Context Service and can be used via:

1. **MCP Tools:**
   - `list_modules()` - Show available project templates
   - `create_project("my-project", template="module-id")` - Create project from template

2. **Project Creation Process:**
   - **Configuration tier** → Project system files (hidden from user)
   - **Protected-files tier** → Author-protected file backups (invisible to users/AI)
   - **Content tier** → User's complete workspace (AI instructions, templates, guides, content)

3. **User Experience:**
   - Users work entirely in the `content/` workspace
   - Everything is user-editable: AI instructions, templates, guides, and content
   - Protected-files is invisible - used only for author-protected file restoration

## Contributing New Modules

To add a new module:

1. Create a new directory with a descriptive name
2. Add required `module.json` configuration
3. Include `README.md` with module documentation
4. Create `AI_instructions/` with project context
5. Organize domain-specific content in logical folders
6. Submit pull request for review

## Module Deployment

Modules in this repository are automatically synchronized to:
- **Production:** `ai-context` R2 bucket under `/modules/`
- **Development:** Local development environments

Changes to this repository trigger automatic deployment to the AI Context Service infrastructure.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions about modules or to request new templates, please:
- Open an issue in this repository
- Contact the AI Context Service development team
- Refer to the main AI Context Service documentation