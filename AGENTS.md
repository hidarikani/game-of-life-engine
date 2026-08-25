# AGENTS.md

Vendor-agnostic file for guiding AI agents, based on
[a simple, open format][agents].

## Introduction

This repo contains a engine for running and managing
[Conway's Game of Life][cgol] simulations. See the following resources:

- [README.md][readme] — for package overview and tips on running it
- [DEVELOPMENT.md][dev] — for coding, quality assurance, and publishing tips
- [CONVENTIONS.md][conventions] — for code and documentation conventions
- [CONTRIBUTING.md][contrib] - explains how contributions are handled
- [LICENSE][license]

## Git workflow

This project uses git worktrees, laid out as follows:

- root
  - `main` — do not touch
  - worktrees
    - `dev` — `dev` branch checked out, human-first coding. The human authors
      commit messages, commits, pushes, and creates PRs. Your job here is to
      assist with questions and help edit specific changes.
    - `agent` — `agent` branch checked out, agent-first coding. The human
      provides requirements; you create the implementation, QA it, commit, push,
      and create the PR.

Reuse branches rather than creating a new one per feature. For example, after a
PR based on `agent` has been merged, reset the branch with:

```bash
# while on agent branch
git fetch origin --prune
git reset --hard origin/main
git push --force-with-lease
```

## Quality Assurance

Quality assurance checks SHALL be executed **before commiting** as described in
[DEVELOPMENT.md][dev].

<!-- Internal -->

[readme]: ./README.md
[dev]: ./DEVELOPMENT.md
[conventions]: ./CONVENTIONS.md
[contrib]: /CONTRIBUTING.md
[license]: ./LICENSE

<!-- External -->

[agents]: https://agents.md/
[cgol]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
