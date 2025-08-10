# D&D Character Creation Guide for AI Assistants

## Character Creation Workflow

Follow this exact sequence when helping users create D&D characters. **Do NOT continue to the next step until the user explicitly approves and states they are ready to move on.**

### Step 1: Character Concept & Race Selection
1. Discuss character concept and roleplay ideas
2. Reference `Building a character/PHB Creating a character.md` for official races
3. For Minecraft races, use `Building a character/Minecraft DND Race stats and build.md`
4. Help user select race based on concept and mechanical preferences
5. Apply racial ability score improvements and traits
6. **WAIT for user approval before proceeding**

### Step 2: Class Selection
1. Reference `Building a character/Resources/Classes.md` for all class options
2. Discuss class features, hit dice, proficiencies, and starting equipment
3. Help user select class that fits their concept and playstyle
4. Record class features and starting proficiencies
5. **WAIT for user approval before proceeding**

### Step 3: Ability Scores
1. Guide through ability score generation (standard array, point buy, or rolling)
2. Apply racial bonuses to ability scores
3. Calculate ability modifiers
4. Ensure scores align with class requirements
5. **WAIT for user approval before proceeding**

### Step 4: Background Selection
1. Reference `Building a character/Resources/Backgrounds.md`
2. Help select background that fits character story
3. Apply background skill proficiencies and features
4. Record background equipment and characteristics
5. **WAIT for user approval before proceeding**

### Step 5: Equipment & Starting Gear
1. Reference `Building a character/Resources/Equipment.md`
2. Record class starting equipment OR starting wealth
3. Add background equipment
4. Calculate Armor Class, attack bonuses, and damage
5. **WAIT for user approval before proceeding**

### Step 6: Spells (if applicable)
1. Reference appropriate spell list from `Building a character/Resources/Spell Lists/`
2. Help select cantrips and 1st level spells based on class
3. Explain spell slots and spellcasting mechanics
4. Record spell attack bonus and save DC
5. **WAIT for user approval before proceeding**

### Step 7: Final Details
1. Calculate final hit points, AC, saving throws, and skills
2. Help develop character personality, ideals, bonds, and flaws
3. Create character backstory that fits the campaign setting
4. Review completed character sheet for accuracy
5. Save completed character to `characters/active/` folder

## AI Assistant Guidelines

### Communication Rules
- Always reference the exact files mentioned above for rules
- Never make up or assume rules - if information is missing, ask the user
- Be patient and thorough - character creation should not be rushed
- Suggest options but never decide for the user
- Copy and update the character sheet template after every approved step

### Character Sheet Management
- Use the template from `characters/templates/character-sheet-template.md`
- Update the sheet continuously as decisions are made
- Save intermediate versions so progress isn't lost
- Create final version in `characters/active/{character-name}/`

### Rule References
- Primary source: `Building a character/PHB Creating a character.md`
- Classes: `Building a character/Resources/Classes.md`
- Spells: `Building a character/Resources/Spell Lists/Lists/{Class} Spell List.md`
- Equipment: `Building a character/Resources/Equipment.md`
- Backgrounds: `Building a character/Resources/Backgrounds.md`
- Minecraft races: `Building a character/Minecraft DND Race stats and build.md`

### Error Handling
- If you cannot find required information in the reference files, STOP and alert the user
- Ask for clarification rather than making assumptions
- Verify all mechanical choices against the official rules
- Double-check calculations and bonuses before finalizing