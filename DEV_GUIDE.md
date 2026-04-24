# Developer Guide

## Workflow
1. Write/update docs for the section.
2. Implement only that section.
3. Validate the section with `npm run quality:web`.
4. Commit the section.

## Commit Standard
- One commit per section.
- Commit message format:
  - `docs(section-a): routes and architecture baseline`
  - `chore(section-b): scaffold web and api structure`
  - `feat(section-c): implement home page v1`

## TypeScript Function Documentation Standard
For every function in `.ts`/`.tsx`, add a short block like:

```ts
/**
 * Returns the current navigation links for the main header.
 */
function getNavLinks() {
  return [];
}
```

## UI Rules
- Mobile-first classes first, then breakpoint overrides.
- Prefer shadcn/ui primitives.
- Use MUI only when a specific component is justified.

## Backend Rules
- Keep FastAPI minimal and typed.
- Isolate external integrations in `services/`.
- Keep storage adapter separate from route handlers.
