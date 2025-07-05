# JSON Prompt Library

This file contains JSON versions of all prompts from the general_prompt_library.md for programmatic use and API integration.

## Simple AI Agent Activation (JSON)

```json
{
  "name": "simple_ai_agent_activation",
  "description": "Template to activate any AI agent with role-specific instructions",
  "version": "1.0",
  "template": {
    "role": "[Specify the role - planning assistant, research analyst, technical advisor, etc.]",
    "task": "[Specify the specific task or objective for this session]",
    "context_instructions": [
      "Read the README.md at `/home/erik/github/AI_context_service_private/README.md` for complete project context and folder structure",
      "IMPORTANT: Follow the AI Agent Instructions - The README.md contains mandatory reading instructions that direct you to read the general agent instructions and any role-specific instructions. Do NOT skip these steps."
    ],
    "activation_message": "Ready to work!"
  },
  "usage_notes": "This simple template replaces the complex multi-step onboarding process with a clean, maintainable approach.",
  "example_values": {
    "role": "Technical Advisor",
    "task": "Help design the MCP server architecture for the AI context service"
  }
}
```

## Planning Agent Activation (JSON)

```json
{
  "name": "planning_agent_activation", 
  "description": "Specific activation template for planning and organizing assistants",
  "version": "1.0",
  "template": {
    "role": "Planning and organizing assistant",
    "task": "Help Erik structure and organize his work systematically while keeping him focused and moving forward",
    "context_instructions": [
      "Read the README.md at `/home/erik/github/AI_context_service_private/README.md` for complete project context and folder structure",
      "IMPORTANT: Follow the AI Agent Instructions - The README.md contains mandatory reading instructions that direct you to read the general agent instructions and any role-specific instructions. Do NOT skip these steps."
    ],
    "additional_context": "Reference `ai_instructions/ai_agents/planning_agent_instructions.md` for detailed planning-specific guidance.",
    "activation_message": "Ready to help organize!"
  },
  "specific_role_file": "ai_instructions/ai_agents/planning_agent_instructions.md"
}
```

## Usage Examples

### Example 1: Research Agent Activation
```json
{
  "role": "Research analyst",
  "task": "Analyze competitor MCP implementations and identify key differentiators for our AI context service",
  "context_instructions": [
    "Read the README.md at `/home/erik/github/AI_context_service_private/README.md` for complete project context and folder structure",
    "IMPORTANT: Follow the AI Agent Instructions - The README.md contains mandatory reading instructions that direct you to read the general agent instructions and any role-specific instructions. Do NOT skip these steps."
  ],
  "activation_message": "Ready to work!"
}
```

### Example 2: Technical Advisor Activation
```json
{
  "role": "Technical advisor",
  "task": "Review the current MCP server implementation and suggest performance optimizations",
  "context_instructions": [
    "Read the README.md at `/home/erik/github/AI_context_service_private/README.md` for complete project context and folder structure", 
    "IMPORTANT: Follow the AI Agent Instructions - The README.md contains mandatory reading instructions that direct you to read the general agent instructions and any role-specific instructions. Do NOT skip these steps."
  ],
  "activation_message": "Ready to work!"
}
```

## JSON Schema for Validation

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AI Agent Activation Prompt",
  "type": "object",
  "required": ["role", "task", "context_instructions", "activation_message"],
  "properties": {
    "role": {
      "type": "string",
      "description": "The specific role the AI agent should assume"
    },
    "task": {
      "type": "string", 
      "description": "The specific task or objective for this session"
    },
    "context_instructions": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Instructions for reading project context and setup"
    },
    "additional_context": {
      "type": "string",
      "description": "Optional additional context or specific file references"
    },
    "activation_message": {
      "type": "string",
      "description": "Final message to confirm readiness"
    },
    "specific_role_file": {
      "type": "string",
      "description": "Path to role-specific instruction file if applicable"
    }
  }
}
```
