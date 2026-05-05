# Pen Rules

This folder is operational context for Codex. Keep it small.

## Source Order

1. Current user task or `.codex-task.md`
2. `.pen/rules.md`
3. `.pen/modes/<mode>.md`
4. `.pen/approvals.md`
5. Listed `.pen/context/*` files
6. Existing repo patterns and types

## Repo Boundary

Keep source code, tests, safe config, short setup docs, active task briefs, and recent completion notes in repo.

Put long-term decisions, client notes, prompt libraries, AI skills, and full project memory in Notion.

## Context Hygiene

Read only the files needed for the active task. Do not bulk-load docs, prompt history, old project snapshots, or unrelated generated folders.

## Hard Stops

Do not edit or expose secrets, `.env` values, lockfiles, dependencies, deployment settings, auth, payment, Stripe, Cal.com, booking logic, API behavior, navigation, `data/*.json`, or `attachments/*` without explicit approval.
