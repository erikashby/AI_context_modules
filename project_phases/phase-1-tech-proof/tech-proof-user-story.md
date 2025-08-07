# Tech Proof User Story - AI Context Navigation

## Product Manager Brief to Development Team

### What We're Building: Context Folder Navigation System

We're creating a **tech proof-of-concept** that demonstrates how AI assistants (like Claude) can intelligently navigate and use structured context data. This is the foundation technology for our ConaaS platform.

**Core Concept**: Present user context to AI assistants as familiar folder structures that they can explore and understand intuitively, similar to how they already work with filesystem navigation.

### The Vision in Action

Instead of users re-explaining context every conversation:
```
❌ Current State:
User: "Help me plan my day"
User: "I'm working on the Johnson presentation due Thursday, have a budget meeting at 2pm, soccer pickup at 6pm..."

✅ Target State:
User: "Help me plan my day" 
AI: [navigates context folders, reads current priorities and schedule]
AI: "Your Johnson presentation needs 2 hours before Thursday's deadline, budget meeting prep takes 30 minutes..."
```

## Required MCP Tasks (Developer Implementation)

Implement these **4 core tasks** that wrap our existing filesystem tools:

### 1. `list_projects`
**Purpose**: Show available context projects to AI assistant
**Implementation**: Return hardcoded list for tech proof
**Expected Response**:
```json
{
  "projects": [
    {
      "id": "personal-organization", 
      "name": "Personal Organization",
      "description": "Daily planning, projects, and life management"
    },
    {
      "id": "personal-health", 
      "name": "Personal Health", 
      "description": "Fitness, nutrition, and wellness tracking"
    }
  ]
}
```

### 2. `explore_project`
**Purpose**: Get folder structure overview of a specific project
**Parameters**: `project_id` (string)
**Implementation**: Use `directory_tree` on project folder
**Example**: `explore_project("personal-organization")` returns folder structure

### 3. `list_folder_contents` 
**Purpose**: Show files/folders in a specific project path
**Parameters**: `project_id` (string), `folder_path` (string)
**Implementation**: Use `list_directory` on combined path
**Example**: `list_folder_contents("personal-organization", "current-status")` shows priorities.md, this-week.md, etc.

### 4. `read_file`
**Purpose**: Read specific context files
**Parameters**: `project_id` (string), `file_path` (string)  
**Implementation**: Use `read_file` on combined path
**Example**: `read_file("personal-organization", "current-status/priorities.md")`

## Project Structure to Implement

**For Tech Proof**: Implement ONLY the `personal-organization` project with sample content. Show `personal-health` in project list but return "Not implemented yet" if accessed.

### personal-organization/ Structure
```
personal-organization/
├── README.md                    # Project overview and navigation guide
├── current-status/
│   ├── README.md               # What this folder contains  
│   ├── priorities.md           # Current top priorities
│   ├── this-week.md           # This week's focus and schedule
│   └── decisions-pending.md    # Decisions that need to be made
├── planning/
│   ├── README.md               # Daily routines, energy patterns, weekly template
│   └── 2025/
│       └── 2025-07-06/         # Week starting July 6, 2025
│           ├── weekly_notes_2025-07-06.md   # Week-level planning and overview
│           ├── daily_notes_2025-07-06.md    # Sunday
│           ├── daily_notes_2025-07-07.md    # Monday  
│           ├── daily_notes_2025-07-08.md    # Tuesday
│           ├── daily_notes_2025-07-09.md    # Wednesday
│           ├── daily_notes_2025-07-10.md    # Thursday
│           ├── daily_notes_2025-07-11.md    # Friday (today)
│           └── daily_notes_2025-07-12.md    # Saturday
├── projects/
│   ├── README.md               # Active, planning, completed project organization
│   ├── active/
│   ├── planning/  
│   └── completed/
└── goals-and-vision/
    ├── README.md               # Long-term goals and vision context
    ├── annual-goals.md         # This year's main objectives
    ├── quarterly-focus.md      # Current quarter priorities
    └── life-vision.md          # Long-term direction
```

## Sample Content to Create

Create realistic sample content that demonstrates the value:

**priorities.md**: Current work projects, family commitments, health goals
**this-week.md**: Specific weekly schedule and focus areas  
**weekly_notes_2025-07-06.md**: This week's main objectives, key meetings, weekly themes
**daily_notes_2025-07-11.md**: Today's plans, meetings, tasks
**annual-goals.md**: 3-5 major goals for 2025
**active/ projects**: 2-3 sample projects with realistic details

## Success Criteria

**Technical Success**: AI assistant can navigate folder structure and access content
**User Experience Success**: AI provides intelligent responses based on actual context
**Value Demonstration**: Clear improvement over "explain everything" conversations

## Expected AI Workflow
```
1. User: "Help me plan my day"
2. AI calls list_projects() → sees personal-organization available
3. AI calls explore_project("personal-organization") → understands folder structure  
4. AI calls list_folder_contents("personal-organization", "current-status") → sees priorities.md, this-week.md
5. AI calls read_file("personal-organization", "current-status/priorities.md") → gets context
6. AI calls read_file("personal-organization", "planning/2025/2025-07-06/weekly_notes_2025-07-06.md") → gets weekly context
7. AI calls read_file("personal-organization", "planning/2025/2025-07-06/daily_notes_2025-07-11.md") → gets today's context
8. AI provides intelligent planning based on real context (weekly + daily)
```

## Development Notes

- **Start Simple**: Hardcode project paths and content for tech proof
- **Focus on Navigation**: Ensure Claude can easily explore and understand structure  
- **Realistic Content**: Make sample data believable to demonstrate value
- **Error Handling**: Basic "file not found" or "project not implemented" responses
- **Performance**: Should feel instant to user (sub-200ms for navigation tasks)

**This tech proof validates that structured context navigation works before we build authentication, real data integration, and production architecture.**