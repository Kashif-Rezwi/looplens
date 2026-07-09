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

- [ ] Set up framework and dependencies
- [ ] Configure TypeScript
- [ ] Configure styling
- [ ] Add base layout
- [ ] Add sample project data
- [ ] Add initial responsive shell

## Phase 2: Import and Parsing

- [ ] Build project metadata form
- [ ] Build `LOOP.md` paste importer
- [ ] Implement parser
- [ ] Preserve raw source text
- [ ] Extract evidence URLs
- [ ] Render parsed iteration cards
- [ ] Allow iteration editing

## Phase 3: Report Modes

- [ ] Build Timeline View
- [ ] Build Judge Mode
- [ ] Build Portfolio Mode
- [ ] Add evidence completeness score
- [ ] Add deterministic summaries
- [ ] Add Markdown export

## Phase 4: Public Sharing

- [ ] Add persistence layer
- [ ] Save project reports
- [ ] Generate public slug or ID
- [ ] Build public read-only report page
- [ ] Add publish warning for sensitive content
- [ ] Verify public URL works without local state

## Phase 5: Verification

- [ ] Add unit tests for parser
- [ ] Add tests for evidence score
- [ ] Add tests for Markdown export
- [ ] Run local build
- [ ] Deploy public app
- [ ] Run TestSprite CLI
- [ ] Fix failures
- [ ] Rerun TestSprite
- [ ] Update `LOOP.md`

## Phase 6: Submission Polish

- [ ] Update README with live URL
- [ ] Add final loop coverage summary
- [ ] Publish LoopLens report for LoopLens
- [ ] Prepare Discord submission text
- [ ] Record optional demo video
- [ ] Confirm repo is public

