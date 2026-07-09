# App Routes

This folder is reserved for future route and layout files.

Do not add application code here until the implementation phase starts.

## Planned MVP Routes

- `/`: Main product entry and report workspace.
- `/sample`: Preloaded demo report for judges, demos, and TestSprite smoke checks.
- `/report/[slug]`: Public read-only report page.
- `/api/reports`: Optional persistence route if server actions are not enough.

## Route Rules

- Public report routes must load from server-backed published data.
- Draft editing can use local browser state.
- API routes should stay thin and delegate to `src/server`.
