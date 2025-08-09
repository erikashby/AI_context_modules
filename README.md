# AI Context Service - Main Repository

## IMPORTANT AI AGENT INSTRUCTIONS

**ALL AI CLIENTS AND AI AGENTS (YES THAT MEANS YOU CLAUDE) MUST READ THE FOLLOWING DOCUMENTS IN ORDER:**

1. **This README.md** (for project context)
2. **Documentation Repository** at `/home/erik/github/AI_context_service_docs/` - Contains all project documentation
3. **`AI_context_service_docs/ai_instructions/ai_agents/general_agent_instructions.md`** (foundational working principles for ALL agents)
4. **Your role-specific instructions** (if applicable, found in docs repo `ai_instructions/ai_agents/`)

**Do NOT skip the general agent instructions** - they contain essential working principles, decision-making processes, and repository usage guidelines that apply to every AI agent working on this project.

---

**Main Repository Path:** `/home/erik/github/AI_context_service_private/`
**Documentation Repository Path:** `/home/erik/github/AI_context_service_docs/`

*Note: All documentation has been moved to the separate docs repository for easier management across development branches.*

---
## Project Overview

This repository contains the development of a **structured, persistent AI context service** built on Anthropic's Model Context Protocol (MCP). The service stores and retrieves rich contextual data (meetings, projects, user preferences, etc.) in a standardized, schema-driven way, allowing AI assistants to instantly access task-relevant context across sessions.

**Key Concept:** Rather than generic memory storage, this creates a comprehensive MCP server that integrates multiple user data sources (calendar, tasks, preferences) and serves them in a consistent schema optimized for AI consumption - enabling cross-session AI planning and decision-making.

**Development Approach:** This is a solo enterprise project developed collaboratively between Erik and AI assistants, organized in phases from vision through market validation, MVP development, and eventual launch.

## Repository Structure

### Main Repository (AI_context_service_private)

**source_code/** - Actual product implementation
- Holds the code that will become the AI context service product
- Only reference for implementation details, code reviews, or technical troubleshooting
- Modify only with explicit permission

**package.json** - Project configuration and scripts
**railway.toml** - Deployment configuration

### Documentation Repository (AI_context_service_docs)

All project documentation has been moved to a separate repository for easier management:

**ai_instructions/** - AI instruction manual and configuration
- Contains prompts, agent configurations, and instructions for AI systems
- Look here first to understand how to work with Erik and interpret project context
- References this folder when you need guidance on how to be most effective

**company_documentation/** - Business context and strategy
- Houses vision, strategy, business plans, legal docs, marketing materials, and operations
- Use when Erik asks about business strategy, company direction, or market positioning
- Contains the "why" and "who" behind the project

**project_phases/** - Chronological development phases
- Contains phase-specific planning, progress, and lessons learned from project development
- Reference when understanding project history, phase-specific decisions, or temporal progression
- Contains the chronological "when" and "how we got here" of development

**core_product_and_engineering/** - Technical foundation and architecture
- Contains foundational technical architecture, system design, and cross-phase engineering specifications
- Reference when discussing core technical decisions, system architecture, or foundational product features
- Contains the enduring "what" and "how" of what we're building

### Usage Guidelines for AI Assistants

Always consider which repository contains the most relevant context for the current discussion:
- **Business questions** → AI_context_service_docs/company_documentation
- **Phase-specific questions** → AI_context_service_docs/project_phases
- **Technical/architecture questions** → AI_context_service_docs/core_product_and_engineering  
- **Implementation questions** → AI_context_service_private/source_code
- **How to work effectively** → AI_context_service_docs/ai_instructions
