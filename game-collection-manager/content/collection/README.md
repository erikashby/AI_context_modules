# Game Collection

This is your main collection inventory - all your owned games and hardware organized for easy AI browsing and management.

## Organization

### Games (`games/`)
Games are organized by platform in individual files:
- `nintendo-switch/` - Nintendo Switch games
- `playstation/` - PlayStation games (PS4, PS5, etc.)  
- `xbox/` - Xbox games (One, Series X/S, etc.)
- `pc/` - PC games (Steam, Epic, GOG, etc.)
- `other-platforms/` - Retro consoles, handhelds, other systems

Each game gets its own file using the template from `templates/game-entry-template.md`

### Hardware (`hardware/`)
Hardware is organized by type in shared files:
- `consoles.md` - Gaming consoles and main systems
- `controllers.md` - Controllers and input devices
- `vr-systems.md` - VR headsets and accessories
- `handhelds.md` - Portable gaming devices

## Adding New Items

### Games
1. Navigate to the appropriate platform folder
2. Create a new file using lowercase-with-hyphens.md naming
3. Copy the game entry template and fill in details
4. Essential fields: Title, Platform, Genre, Release Year, Ownership, Purchase Price, Condition

### Hardware  
1. Open the appropriate hardware category file
2. Add your new hardware using the hardware template format
3. Include compatibility information to help with game recommendations

## AI Assistant Usage

Your AI can help with:
- "Show me all my Nintendo Switch games" (browses the nintendo-switch folder)
- "What's the condition of Zelda?" (reads specific game file)  
- "What consoles do I own?" (checks hardware files)
- "Recommend something to play" (analyzes your collection for suggestions)

## Tips

- **Consistent naming**: Use similar patterns for easy browsing
- **Keep it updated**: Add games as you acquire them
- **Use templates**: Templates help maintain consistent, searchable information
- **Include details**: More information helps AI give better recommendations