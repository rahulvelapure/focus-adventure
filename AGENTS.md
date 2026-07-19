# AGENTS.md

## Project

Focus Adventure is an open-source application built with children with ADHD in mind.

The core experience is intended to remain free and accessible to children and families.

## Development Guidelines

- Keep changes focused and minimal.
- Do not commit secrets, API keys, credentials, or `.env` files.
- Do not manually edit generated files unless explicitly required.
- Test changes before submitting a pull request.
- Maintain accessibility and child-friendly UX.
- Avoid unsupported medical or therapeutic claims.
- Follow the contribution guidelines in `CONTRIBUTING.md`.

## Lovable Synchronization

This repository is connected to Lovable.

Avoid rewriting published Git history on the connected branch, including:

- Force pushing
- Rebasing already-pushed commits
- Amending already-pushed commits
- Squashing already-pushed commits

Rewriting published history may interfere with synchronization and project history in Lovable.

Commits pushed to the connected branch may synchronize back to Lovable. Keep the connected branch in a working and buildable state.

## Pull Requests

External contributors should work in separate branches and submit changes through Pull Requests rather than pushing directly to the protected main branch.
