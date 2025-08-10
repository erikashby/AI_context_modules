# Planning Structure

This folder uses a hierarchical time-based planning system for easy navigation and AI assistance.

## Folder Structure

```
planning/
└── {YEAR}/                    # e.g., 2025/
    └── {MM-month}/            # e.g., 07-july/
        ├── month_plan.md      # Monthly overview and themes
        └── week-{N}/          # e.g., week-1, week-2, week-3, week-4, week-5
            ├── week_plan.md   # Weekly focus and objectives
            └── day_{DD}.md    # e.g., day_01.md, day_15.md, day_31.md
```

## Navigation Examples

- **Today's plan**: `planning/2025/07-july/week-5/day_29.md`
- **This week's plan**: `planning/2025/07-july/week-5/week_plan.md`
- **This month's plan**: `planning/2025/07-july/month_plan.md`

## Creating New Structure

### New Month
1. Create folder: `planning/2025/08-august/`
2. Create file: `month_plan.md`
3. Create week folders: `week-1/`, `week-2/`, `week-3/`, `week-4/`, `week-5/` (as needed)

### New Week
1. Navigate to month folder: `planning/2025/08-august/`
2. Create folder: `week-2/`
3. Create file: `week_plan.md`
4. Create daily files as needed: `day_08.md`, `day_09.md`, etc.

## File Templates

### month_plan.md
- Monthly theme and focus areas
- Key objectives and deliverables
- Important dates and deadlines
- Resource allocation

### week_plan.md
- Weekly priorities (3-5 maximum)
- Time blocks and scheduling
- Key meetings and commitments
- Success metrics

### day_DD.md
- Daily priorities (1-3 maximum)
- Time-blocked schedule
- Energy and focus allocation
- End-of-day review

## AI Navigation Benefits

This structure allows AI assistants to easily:
- Find current planning context using date calculations
- Navigate between different time horizons (day → week → month)
- Understand planning hierarchy and relationships
- Provide time-relevant recommendations and insights

## Sample Structure

The `2025/07-july/week-5/` folder contains sample files showing the expected format and content structure.