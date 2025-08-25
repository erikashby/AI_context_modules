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
    │   │   │   ├── README.md
    │   │   │   ├── zelda-breath-of-wild.md
    │   │   │   ├── mario-kart-8-deluxe.md
    │   │   │   └── [individual-game-files.md]
    │   │   ├── playstation/
    │   │   │   ├── README.md
    │   │   │   ├── god-of-war.md
    │   │   │   ├── spider-man.md
    │   │   │   └── [individual-game-files.md]
    │   │   ├── xbox/
    │   │   │   ├── README.md
    │   │   │   ├── halo-infinite.md
    │   │   │   ├── forza-horizon-5.md
    │   │   │   └── [individual-game-files.md]
    │   │   ├── pc/
    │   │   │   ├── README.md
    │   │   │   ├── cyberpunk-2077.md
    │   │   │   ├── steam-games/
    │   │   │   ├── epic-games/
    │   │   │   └── [individual-game-files.md]
    │   │   └── other-platforms/
    │   │       ├── README.md
    │   │       └── [individual-game-files.md]
    │   └── hardware/
    │       ├── README.md
    │       ├── consoles.md
    │       ├── controllers.md
    │       ├── vr-systems.md
    │       └── handhelds.md
    ├── planning/
    │   ├── README.md
    │   ├── wishlist.md
    │   ├── sell-list/
    │   │   ├── README.md
    │   │   ├── considering.md
    │   │   ├── ready-to-sell.md
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
**Individual game files** within platform folders enables:
- AI can read specific games without loading entire collection
- Easy to add rich content per game (detailed notes, screenshots, guides)
- Natural file-per-item organization that scales with any collection size
- Efficient lookups: "What's the condition of Zelda?" reads one file
- Cross-game queries use folder listings: "Show me Nintendo Switch games"

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
**Single wishlist file**:
- All wishlist items in one easy-to-edit file
- Prevents duplicate entries
- Simple list format with priority indicators
- Quick to browse and update

**Sell list workflow with dedicated folder**:
- Separate files for each stage: considering.md → ready-to-sell.md → sold-items.md
- README.md contains specific selling instructions and tips
- Tracks the decision-making process and historical sales records
- Single file per stage prevents duplicates within each category

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

### Wishlist Template (Single File)
```markdown
# Game Collection Wishlist

## High Priority
- **The Legend of Zelda: Tears of the Kingdom** (Nintendo Switch) - Target: $45 | Market: $55 | Why: Sequel to BOTW
- **God of War Ragnarök** (PlayStation 5) - Target: $35 | Market: $40 | Why: Complete the series

## Medium Priority  
- **Elden Ring** (PC/Steam) - Target: $30 | Market: $40 | Why: From Software RPG
- **Halo Infinite** (Xbox Series X) - Target: $25 | Market: $30 | Why: Classic Halo experience

## Low Priority
- **Cyberpunk 2077** (PC) - Target: $20 | Market: $25 | Why: After patches, worth trying
- **Gran Turismo 7** (PlayStation 5) - Target: $35 | Market: $45 | Why: Racing sim

## Notes
- Check Steam sales quarterly for PC games
- Monitor PlayStation Direct for exclusives
- Set price alerts on Deku Deals for Nintendo games
```

## AI Instructions Strategy

### Communication Style
- **Gaming-focused**: Understand game terminology and culture
- **Helpful and enthusiastic**: Match user's passion for collecting
- **Practical**: Focus on actionable advice and clear information
- **Non-judgmental**: Respect all gaming preferences and budgets

### User Customization
- **AI instructions are user-editable**: Users can modify AI behavior and communication style
- **Reference materials are user-editable**: Users can customize standards, add local resources
- **Templates are user-editable**: Users can modify data entry formats to their preferences
- **Full user control**: Both AI behavior and reference data can be personalized

### Context Navigation Priority
1. **Planning files** (wishlist.md, sell-list/) - for immediate buying/selling decisions
2. **Collection games** (platform folders with individual files) - for recommendations and comparisons  
3. **Hardware inventory** - for compatibility and capability questions
4. **Activity logs** - for recent gaming patterns and play history
5. **Reference materials** - for condition standards, platform info, pricing resources
6. **Templates** - for consistent data entry guidance

### Key Behaviors
- **Collection browsing**: Use folder listings to browse platforms, read individual game files
- **Individual game lookups**: Directly access specific game files for detailed information
- **Recommendation engine**: Suggest based on owned games and preferences by reading relevant files
- **Price awareness**: Help with value assessment and deal recognition
- **Organization assistance**: Guide optimal collection management and file naming

## Implementation Benefits

### For Users
- **Intuitive structure**: Matches how gamers think about their collections
- **Flexible depth**: Essential info only, optional details for enthusiasts
- **Clear workflows**: Logical progression from wishlist to collection to potential sale
- **AI-enhanced**: Get smart recommendations and collection insights

### For AI Assistant
- **Efficient file access**: Read only the files needed for each query
- **Predictable navigation**: Clear folder hierarchy for reliable context discovery
- **Structured data**: Templates ensure consistent, parseable information
- **Rich per-game context**: Detailed information available for each game
- **Scalable browsing**: Folder listings provide overview, individual files provide depth
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