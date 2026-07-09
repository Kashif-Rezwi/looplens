# Server

## Purpose

This folder is reserved for future server-only code inside the Next.js app.

LoopLens is not planning a separate backend service for the MVP. The backend layer should live in the same deployable app, with server-only logic isolated here and called by server actions or API routes.

## MVP Server Responsibilities

Expected responsibilities:

- Persist published reports
- Load public reports by slug
- Generate or validate public slugs
- Store publish-safety metadata
- Keep draft and published states separate
- Handle optional AI summary requests if that feature is added

## Persistence Decision

The MVP uses:

- Local-first draft editing in the browser
- Server-backed published reports
- No authentication in v1

Public report pages must not depend on local storage.

## Usage Rule

Keep request/response wiring thin. Business logic should live in server services here or in pure utilities under `src/lib`.
