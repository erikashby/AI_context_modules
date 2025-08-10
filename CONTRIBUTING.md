# Contributing to AI Context Service Modules

Thank you for your interest in contributing project templates to the AI Context Service! This guide will help you create high-quality modules that provide value to users.

## Module Development Guidelines

### 1. Module Structure Requirements

Every module must include:

```
your-module-name/
├── module.json              # Required: Module metadata
├── README.md                # Required: Module documentation
├── AI_instructions/         # Required: AI context files
│   ├── README.md           # Required: AI instruction overview
│   └── project-context.md  # Required: Project-specific AI guidance
├── domain-content/         # Required: Your module's content
└── templates/              # Optional: Reusable template files
```

### 2. Module Naming Conventions

- Use lowercase with hyphens: `my-awesome-module`
- Be descriptive but concise: `fitness-tracking-v1`
- Include version suffix for major iterations: `-v1`, `-v2`
- Avoid generic names like `template` or `project`

### 3. Module.json Configuration

Your `module.json` must follow this schema:

```json
{
  "module": {
    "id": "your-module-name",
    "name": "Human-Readable Module Name", 
    "version": "1.0.0",
    "description": "Clear, concise description of module purpose",
    "author": "Your Name",
    "created": "2025-08-10",
    "updated": "2025-08-10",
    "tags": ["productivity", "health", "planning"],
    "category": "personal|business|creative|technical|education"
  },
  "structure": {
    "folder_name": "Clear description of folder purpose",
    "another_folder": "What users will find in this folder"
  },
  "features": [
    "Feature 1: Specific capability provided",
    "Feature 2: Another key functionality",
    "Feature 3: Unique value proposition"
  ],
  "requirements": {
    "skill_level": "beginner|intermediate|advanced",
    "time_commitment": "daily|weekly|monthly|as-needed"
  }
}
```

### 4. AI Instructions Best Practices

#### project-context.md Structure:
```markdown
# [Module Name] - AI Project Context

## Project Overview
Brief description of what this project helps users accomplish.

## Core Objectives
- Primary goal 1
- Primary goal 2
- Primary goal 3

## AI Assistant Guidelines

### Communication Style
- Tone and approach preferences
- Level of detail expected
- Interaction patterns

### Context Priorities
1. Most important context to maintain
2. Secondary context considerations
3. Background information to track

### Navigation Guidance
- Key files and folders to reference
- Workflow sequences to follow
- Decision points that require attention

### Error Prevention
- Common mistakes to avoid
- Validation steps to take
- Safety checks to implement

## Success Metrics
How to measure if the project is achieving its goals.
```

### 5. Content Organization Principles

#### Hierarchical Structure:
- **Top-level folders**: Major functional areas
- **Subfolders**: Specific categories or time periods
- **Files**: Individual items or templates

#### Naming Conventions:
- Use clear, descriptive names
- Maintain consistent capitalization
- Include dates for time-sensitive content

#### README Files:
- Each major folder should have a README.md
- Explain folder purpose and contents
- Provide usage instructions

### 6. Template Quality Standards

#### Content Quality:
- Well-written, clear instructions
- Practical, actionable guidance
- Relevant examples and templates
- Proper markdown formatting

#### AI Integration:
- Context files that enhance AI assistance
- Clear guidance for AI behavior
- Structured information for AI processing

#### User Experience:
- Intuitive folder organization
- Easy to understand file names
- Helpful documentation throughout

## Submission Process

### 1. Development
1. Fork this repository
2. Create your module directory
3. Develop content following guidelines above
4. Test module structure and content

### 2. Quality Check
- [ ] `module.json` follows required schema
- [ ] All required files are present
- [ ] AI instructions are comprehensive
- [ ] Content is well-organized and documented
- [ ] README.md explains module purpose and usage

### 3. Pull Request
1. Submit pull request with clear description
2. Include rationale for module creation
3. Highlight key features and benefits
4. Reference any related issues or requests

### 4. Review Process
- Module structure validation
- Content quality review
- AI instruction effectiveness assessment
- Community feedback integration

## Module Categories

We accept modules in these categories:

- **Personal**: Productivity, health, learning, hobbies
- **Business**: Project management, planning, analysis
- **Creative**: Writing, design, content creation
- **Technical**: Development, documentation, systems
- **Education**: Learning, research, knowledge management

## Examples of Good Modules

Reference the existing modules for examples:
- `personal-effectiveness-v1`: Well-structured personal productivity
- `dnd-character-development`: Comprehensive domain expertise

## Getting Help

If you need assistance:
- Open an issue for questions or clarifications
- Review existing modules for patterns
- Ask in discussions for community input

Thank you for contributing to the AI Context Service ecosystem!