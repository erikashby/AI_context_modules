# Game Collection Manager - Template Requirements

## Module Overview

**Domain**: Video game collection management and tracking  
**Target Users**: Video game collectors and enthusiasts  
**Core Purpose**: Organize, track, and manage video game collections with AI assistance

## Use Cases and Workflows

### 1. Adding New Games/Hardware to Collection
- Add games with essential information (title, platform, condition, price)
- Track hardware components (consoles, controllers, VR systems)
- Minimal required fields to avoid overwhelming users
- Optional detailed tracking for power users

### 2. Reviewing Existing Games/Hardware
- Browse collection by platform, genre, condition
- View individual game/hardware details
- Search and filter collection items
- Access purchase history and notes

### 3. Wishlist Management
- Track desired games and hardware
- Set price targets for wishlist items
- Monitor for deals and price drops
- Move items from wishlist to collection when purchased

### 4. Sell List Tracking
- Maintain list of items considering for sale
- Track condition and potential sale value
- Remove items from collection when sold
- Manage selling decisions and pricing

### 5. Play Logging (Optional)
- Log gaming sessions and experiences
- Track what games were played when
- Add notes about gaming experiences
- Update game status and ratings

### 6. AI Recommendations and Queries
- Get game suggestions for different situations
- Find games based on mood or social context
- Discover collection gaps and opportunities
- Receive personalized recommendations

## Data Structure Requirements

### Games Information
#### Essential Fields
- Title
- Platform/Console
- Genre
- Release Year
- Purchase Price
- Current Condition (Mint, Good, Fair, Poor)
- Ownership Type (Physical, Digital)

#### Optional Fields
- Completion Status
- Your Rating (1-10)
- Last Played Date
- Purchase Date
- Purchase Location
- Current Market Value
- Playtime Hours
- Multiplayer Support
- Notes
- Box/Manual Status

### Hardware Information
#### Essential Fields
- Name/Model
- Type (Console, Controller, VR, Handheld)
- Condition
- Purchase Price

#### Optional Fields
- Purchase Date
- Warranty Status
- Compatibility Information
- Modifications
- Storage Capacity
- Notes

## AI Query Capabilities

### Collection Browsing
- "Show me all my Nintendo Switch games"
- "What RPGs do I own?"
- "List my physical PlayStation games"
- "What games do I have in mint condition?"

### Recommendation Queries
- "Suggest something retro to play from my collection"
- "What multiplayer games can I play with 4 friends locally?"
- "Recommend a game from my backlog"
- "What's a good co-op game I own?"
- "Show me games similar to [specific game I own]"

### Wishlist/Purchase Tracking
- "What games are on my wishlist?"
- "Add [game] to my wishlist"
- "Show me wishlist items under $30"
- "Remove [game] from wishlist - I bought it"
- "See if I can get Mario Kart for less than $40"
- "Check prices for [wishlist game] under my target price"

### Sell List Tracking
- "What am I considering selling?"
- "Add [game] to my sell list"
- "Show me sell candidates in poor condition"
- "Remove [game] from sell list - keeping it"

### Value/Price Queries
- "What's the value of [specific game]?"
- "What is Zelda worth right now?"
- "Show me current market price for [game]"
- "What did I pay vs current value for [game]?"

### Individual Item Queries
- "What did I pay for [specific game]?"
- "What condition is [game] in?"
- "Show me details about [specific game]"

### Log-Based Actions
- "Log that I played Zelda today"
- "Add notes about my experience with [game]"
- "Update the condition of [game] to Fair"
- "Mark [game] as sold for $[price]"

## Technical Constraints

### File-Based System
- AI works with files, not databases
- No complex calculations or aggregations
- Focus on individual item lookups and list management
- Simple filtering and browsing capabilities

### User Experience Priorities
- Minimal required fields for quick entry
- Optional detailed tracking for enthusiasts
- Clear organization for easy AI navigation
- Templates for consistent data entry

## Module Structure Requirements

### Folder Organization
- Collection management (games, hardware)
- Wishlist tracking
- Sell list management  
- Play logs and experiences
- Templates and reference materials
- AI instructions and context

### AI Behavior
- Direct and helpful responses
- Game knowledge and recommendations
- Price and value awareness
- Collection organization expertise
- Respectful of user's gaming preferences

## Success Metrics

- Easy game and hardware addition workflow
- Effective AI-powered collection browsing
- Useful recommendations and suggestions
- Simple wishlist and sell list management
- Valuable price and market insights