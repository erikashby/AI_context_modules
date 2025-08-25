# Game Collection Manager - Template Design Plan

## Module Architecture Overview

Following the AI Context Service three-tier structure:
- **Configuration**: System metadata and AI behavior rules
- **Protected-files**: Author-protected backups (minimal use)
- **Content**: User's complete editable workspace

## Proposed Folder Structure

```
game-collection-manager/
├── configuration/
│   └── module.json                 # Module metadata and configuration
├── protected-files/
│   └── README.md                   # Explains protection purpose
└── content/
    ├── README.md                   # User workspace documentation
    ├── ai-instructions/
    │   ├── README.md
    │   ├── project-context.md      # AI behavior and communication rules
    │   └── collection-guide.md     # Game collection expertise for AI
    ├── collection/
    │   ├── README.md
    │   ├── games/
    │   │   ├── README.md
    │   │   ├── nintendo-switch/
    │   │   │   └── games-list.md
    │   │   ├── playstation/
    │   │   │   └── games-list.md
    │   │   ├── xbox/
    │   │   │   └── games-list.md
    │   │   ├── pc/
    │   │   │   └── games-list.md
    │   │   └── other-platforms/
    │   │       └── games-list.md
    │   └── hardware/
    │       ├── README.md
    │       ├── consoles.md
    │       ├── controllers.md
    │       ├── vr-systems.md
    │       └── handhelds.md
    ├── planning/
    │   ├── README.md
    │   ├── wishlist/
    │   │   ├── README.md
    │   │   ├── high-priority.md
    │   │   ├── medium-priority.md
    │   │   └── low-priority.md
    │   ├── sell-list/
    │   │   ├── README.md
    │   │   ├── ready-to-sell.md
    │   │   ├── considering.md
    │   │   └── sold-items.md
    │   └── budget-tracking.md
    ├── activity/
    │   ├── README.md
    │   ├── play-logs/
    │   │   ├── README.md
    │   │   ├── 2025/
    │   │   │   ├── january.md
    │   │   │   ├── february.md
    │   │   │   └── [monthly logs]
    │   │   └── session-template.md
    │   └── reviews-and-notes/
    │       ├── README.md
    │       └── game-reviews.md
    ├── templates/
    │   ├── README.md
    │   ├── game-entry-template.md
    │   ├── hardware-entry-template.md
    │   ├── wishlist-item-template.md
    │   ├── sell-item-template.md
    │   └── play-session-template.md
    └── reference/
        ├── README.md
        ├── platform-guide.md
        ├── condition-standards.md
        ├── genre-reference.md
        └── pricing-resources.md
```

## Design Rationale

### 1. Collection Organization
**Platform-based structure** for games enables:
- Easy AI navigation ("Show me Nintendo Switch games")
- Logical user mental model
- Scalable to new platforms
- Clear organization for browsing

**Hardware categories** separate by type:
- Consoles, Controllers, VR, Handhelds
- Easier maintenance and lookup
- Natural grouping for recommendations

### 2. Planning Section
**Wishlist with priority levels**:
- High/Medium/Low priority files
- Easier for AI to suggest based on urgency
- User can focus on most wanted items

**Sell list workflow**:
- Considering → Ready-to-sell → Sold
- Tracks the decision-making process
- Historical record of sales

### 3. Activity Tracking
**Optional play logging**:
- Monthly organization for easy browsing
- Template-based for consistency
- Separate reviews section for longer thoughts

### 4. Templates and Reference
**Comprehensive templates** for:
- Consistent data entry across all items
- AI can easily parse structured information
- User guidance for what information to include

**Reference materials** provide:
- Standards for condition assessment
- Platform and genre information
- Pricing resource guidance

## Key Files Design

### Game Entry Template
```markdown
# [Game Title]

## Basic Information
- **Platform**: [Console/PC]
- **Genre**: [Genre]
- **Release Year**: [Year]
- **Ownership**: Physical/Digital

## Collection Details
- **Purchase Price**: $[Amount]
- **Purchase Date**: [Date] (optional)
- **Current Condition**: Mint/Good/Fair/Poor
- **Purchase Location**: [Store/Online/Friend] (optional)

## Optional Details
- **Current Market Value**: $[Amount]
- **Completion Status**: Not Started/In Progress/Completed/100%
- **Your Rating**: [1-10]
- **Last Played**: [Date]
- **Playtime**: [Hours]
- **Multiplayer**: Local/Online/Max Players
- **Box/Manual**: Complete/Missing/Digital

## Notes
[Personal thoughts, memories, issues, etc.]
```

### Hardware Entry Template
```markdown
# [Hardware Name]

## Basic Information
- **Type**: Console/Controller/VR/Handheld
- **Model**: [Specific model]
- **Condition**: Mint/Good/Fair/Poor
- **Purchase Price**: $[Amount]

## Optional Details
- **Purchase Date**: [Date]
- **Warranty Status**: Active/Expired/None
- **Compatibility**: [What it works with]
- **Storage**: [If applicable]
- **Modifications**: [Any changes made]

## Notes
[Condition details, issues, accessories, etc.]
```

### Wishlist Item Template
```markdown
# [Item Name]

## Target Information
- **Platform**: [Console/PC]
- **Target Price**: $[Maximum willing to pay]
- **Priority**: High/Medium/Low
- **Current Market Price**: $[Research price]

## Why I Want It
[Reason for wanting this game/hardware]

## Price Monitoring
- **Lowest Seen**: $[Amount] on [Date] at [Store]
- **Price Alerts Set**: Yes/No
- **Target Stores**: [Where to watch for deals]

## Notes
[Additional thoughts, sale notifications, etc.]
```

## AI Instructions Strategy

### Communication Style
- **Gaming-focused**: Understand game terminology and culture
- **Helpful and enthusiastic**: Match user's passion for collecting
- **Practical**: Focus on actionable advice and clear information
- **Non-judgmental**: Respect all gaming preferences and budgets

### Context Navigation Priority
1. **Planning files** (wishlist, sell-list) - for immediate decisions
2. **Collection games** - for recommendations and comparisons  
3. **Hardware inventory** - for compatibility and capability questions
4. **Activity logs** - for recent gaming patterns
5. **Templates** - for consistent data entry guidance

### Key Behaviors
- **Collection browsing**: Efficiently search platform-organized files
- **Recommendation engine**: Suggest based on owned games and preferences
- **Price awareness**: Help with value assessment and deal recognition
- **Organization assistance**: Guide optimal collection management

## Implementation Benefits

### For Users
- **Intuitive structure**: Matches how gamers think about their collections
- **Flexible depth**: Essential info only, optional details for enthusiasts
- **Clear workflows**: Logical progression from wishlist to collection to potential sale
- **AI-enhanced**: Get smart recommendations and collection insights

### For AI Assistant
- **Predictable navigation**: Clear folder hierarchy for reliable context discovery
- **Structured data**: Templates ensure consistent, parseable information
- **Rich context**: Multiple information sources for comprehensive assistance
- **Gaming expertise**: Domain-specific knowledge and terminology

### Technical Advantages
- **File-based**: Works within AI Context Service constraints
- **Scalable**: Easy to add new platforms, categories, or features
- **Maintainable**: Clear organization makes updates straightforward
- **Platform-agnostic**: Works regardless of specific gaming platforms

## Next Steps for Implementation

1. **Create module.json** with metadata and folder descriptions
2. **Build AI instructions** with gaming domain expertise and behavior rules
3. **Develop comprehensive templates** for all data entry scenarios
4. **Create reference materials** for condition standards and platform information
5. **Write user documentation** explaining workflows and best practices
6. **Test with sample data** to validate structure and AI interaction patterns

---

*This design balances user-friendly organization with AI-optimized structure while supporting both casual and serious game collectors.*