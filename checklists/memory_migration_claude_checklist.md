# Memory Migration Validation Checklist (Claude Directory)

- [ ] **Configuration**

  - [ ] `.mcp.json` contains `memory` and `fetch` servers.

- **Deprecation**

  - [ ] `.claude/tools/memory-cli.js` has deprecation notice.
  - [ ] `.claude/CLAUDE.md` marks `memory-cli.js` as deprecated.

- **Agent Updates**

  - [ ] `.claude/agents/coder.md` includes Memory logging for errors.
  - [ ] `.claude/agents/code-reviewer.md` includes Memory consultation and lesson saving.
  - [ ] `.claude/CLAUDE.md` reflects native Memory MCP usage.

- **Orchestrator Updates**

  - [ ] `.claude/orchestrator/runbook.md` uses `memory.create_entities` instead of `memory-cli.js`.

- **Verification**
  - [ ] Run a test task and verify Memory entities are created (if possible).
