# Source Directory

## Purpose

This directory contains the LoopLens application source.

## Current Scope

The MVP application is implemented with Next.js App Router, TypeScript, Tailwind CSS, pure report utilities, and server-side publishing.

## Planned Organization

- `app/`: Routes, layouts, API route, and page-level composition.
- `components/`: Reserved for future shared UI components.
- `features/`: Workspace and report rendering modules.
- `lib/`: Pure utilities such as parsing, scoring, summaries, validation, and exports.
- `server/`: Server-side persistence.
- `styles/`: Reserved for future extracted design tokens.
- `types/`: Shared TypeScript report types.
- `data/`: Sample report data.

## Usage Rule

When implementation starts, keep business logic in `lib/` or feature modules instead of burying it inside page components.
