# D&D Character Development Assistant

A comprehensive D&D 5E character creation and management system with AI-guided workflows, complete rule references, and character progression tracking.

## Module Overview

This module provides everything needed for D&D 5E character creation and ongoing character management:

- **Step-by-step character creation** with AI guidance following official D&D 5E rules
- **Complete rule references** including classes, races, spells, equipment, and backgrounds
- **Character storage and progression tracking** for active and completed characters
- **Campaign management** for organizing characters within their game contexts
- **Minecraft D&D integration** with custom race options

## Key Features

- ✨ **AI-Guided Character Creation**: Step-by-step process with expert rule validation
- 📚 **Complete D&D 5E Reference**: All classes, races, spells, equipment, and backgrounds
- 🎭 **Character Management**: Organized storage for active and completed characters
- 🗂️ **Campaign Tracking**: Link characters to campaigns and track party dynamics
- ⚔️ **Custom Content**: Minecraft D&D race integration and variants
- 📝 **Character Sheets**: Complete templates with all necessary fields

## Folder Structure

```
dnd-character-development/
├── AI_instructions/          # AI guidance for character creation
├── characters/               # Character storage and templates
│   ├── active/              # Currently played characters
│   ├── completed/           # Retired characters
│   └── templates/           # Character sheet templates
├── campaigns/               # Campaign information and notes
│   ├── active/              # Current campaigns
│   └── completed/           # Finished campaigns
├── Building a character/    # Complete D&D 5E reference materials
│   ├── Resources/           # Classes, spells, equipment, etc.
│   └── [Reference files]    # Character creation guides
├── Directory.md             # Quick usage instructions
└── Template.md              # Legacy template (see characters/templates/)
```

## Getting Started

### For Character Creation
1. Read `Directory.md` for quick start instructions
2. AI will guide you through the step-by-step process using official D&D 5E rules
3. Character will be saved to `characters/active/{character-name}/`

### For AI Assistants
1. Review `AI_instructions/character-creation-guide.md` for detailed workflow
2. Always reference files in `Building a character/` for official rules
3. Follow the step-by-step process and wait for user approval between steps
4. Save character progress continuously using templates in `characters/templates/`

## Rule References

### Primary Sources
- **Character Creation**: `Building a character/PHB Creating a character.md`
- **Classes**: `Building a character/Resources/Classes.md`
- **Spells**: `Building a character/Resources/Spell Lists/Lists/{Class} Spell List.md`
- **Equipment**: `Building a character/Resources/Equipment.md`
- **Backgrounds**: `Building a character/Resources/Backgrounds.md`

### Custom Content
- **Minecraft Races**: `Building a character/Minecraft DND Race stats and build.md`
- **Feats**: `Building a character/Resources/Feats.md`

## Usage Guidelines

### Character Creation Process
1. **Step-by-step approach**: Never skip steps or rush the process
2. **User approval required**: Wait for explicit approval before proceeding to next step
3. **Rule accuracy**: Always reference official sources for mechanics
4. **Character sheet updates**: Continuously update character sheet during creation
5. **Save progress**: Create intermediate saves to prevent data loss

### Character Management
- Create detailed character folders with consistent naming
- Include backstory, campaign notes, and progression tracking
- Archive completed characters for future reference
- Link characters to their respective campaigns

## Integration with AI Context Service

This module integrates seamlessly with the AI Context Service platform:
- **MCP Integration**: Characters and campaigns accessible via Model Context Protocol
- **AI Context**: Rich character and campaign context for AI assistants
- **Cross-Session Memory**: Character details persist across AI conversations
- **Campaign Continuity**: Maintain campaign state and character relationships

## Support and Documentation

- Review `AI_instructions/` for detailed AI guidance
- Check individual README files in each folder for specific instructions
- Reference official D&D 5E sources for rule clarifications
- Create issues or feedback through the main AI Context Service repository

---

**Version**: 1.0.0  
**Last Updated**: July 31, 2025  
**Compatible with**: D&D 5E rules, AI Context Service platform