# System Overview

## Core Architecture Concept

The AI Context Service is built around a **two-tier architecture** that separates configuration from implementation:

### Modules (Template Layer)
**Modules** are the blueprint/template layer that define the rules, default context, roles, and tasks for specific domains or use cases.

Examples:
- "Personal Planning" module
- "Health" module  
- "Work Project Management" module
- "Financial Planning" module

### Projects (Instance Layer)
**Projects** are the actual working instances created from modules. They contain the live data, user-specific context, and active state for a particular use case.

When a user creates a new project:
1. They select a module (e.g., "Personal Planning")
2. The system creates a new project instance based on that module
3. The project inherits all the module's predefined structure, rules, and default context
4. The user then works within that project with the module's framework automatically applied

## System Components

### MCP Integration Layer
- Implements Anthropic's Model Context Protocol
- Serves structured context data to AI assistants
- Maintains consistent schema across all modules and projects

### Module System
- Template engine for defining project blueprints
- Configuration layer for rules, roles, and default contexts
- Extensible framework for creating new domain-specific modules

### Project Management System
- Instance management for active projects
- Data storage and retrieval for project-specific context
- State tracking and evolution of projects over time

### Data Layer
- Structured storage for both module definitions and project data
- Schema enforcement and validation
- Context retrieval optimized for AI consumption

## Design Principles

1. **Separation of Concerns**: Clear distinction between templates (modules) and instances (projects)
2. **Consistency**: All projects inherit consistent structure from their modules
3. **Extensibility**: New modules can be created for any domain or use case
4. **AI-Optimized**: Data structures designed for efficient AI context consumption
5. **Schema-Driven**: Standardized data models ensure reliable AI interpretation

## Benefits

- **Rapid Project Setup**: Users can quickly start new projects with predefined structure
- **Consistency**: All projects of the same type follow the same patterns
- **Reusability**: Modules can be reused across multiple projects
- **Maintainability**: Changes to module templates can be applied systematically
- **Scalability**: New domains can be added by creating new modules
