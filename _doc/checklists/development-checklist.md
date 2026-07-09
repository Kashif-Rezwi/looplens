# LoopLens Development Checklist

## Purpose

This checklist organizes the MVP build into practical phases. It should be used by humans and agents to track what remains before the app is submission-ready.

## Scope

This checklist starts after the planning-only repository structure is approved. It does not require every future feature to be built before submission.

## Phase 0: Planning and Structure

- [x] Create product idea doc
- [x] Create MVP development doc
- [x] Create agent instructions
- [x] Create architecture plan
- [x] Create user flow doc
- [x] Create testing strategy
- [x] Create submission checklist
- [x] Create initial folder organization

## Phase 1: App Foundation

- [x] Set up framework and dependencies
- [x] Configure TypeScript
- [x] Configure styling
- [x] Add base layout
- [x] Add sample project data
- [x] Add initial responsive shell

## Phase 2: Import and Parsing

- [x] Build project metadata form
- [x] Build `LOOP.md` paste importer
- [x] Implement parser
- [x] Preserve raw source text
- [x] Extract evidence URLs
- [x] Render parsed iteration cards
- [x] Allow iteration editing

## Phase 3: Report Modes

- [x] Build Timeline View
- [x] Build Judge Mode
- [x] Build Portfolio Mode
- [x] Add evidence completeness score
- [x] Add deterministic summaries
- [x] Add Markdown export

## Phase 4: Public Sharing

- [x] Add persistence layer
- [x] Save project reports
- [x] Generate public slug or ID
- [x] Build public read-only report page
- [x] Add publish warning for sensitive content
- [x] Verify public URL works without local state

## Phase 5: Verification

- [x] Add unit tests for parser
- [x] Add tests for evidence score
- [x] Add tests for Markdown export
- [x] Run local build
- [x] Deploy public app
- [ ] Run TestSprite CLI
- [ ] Fix failures
- [ ] Rerun TestSprite
- [x] Update `LOOP.md`

## Phase 6: Submission Polish

- [x] Update README with live URL
- [ ] Add final loop coverage summary
- [ ] Publish LoopLens report for LoopLens
- [ ] Prepare Discord submission text
- [ ] Record optional demo video
- [ ] Confirm repo is public
