# Memory Migration Validation Checklist

- [ ] **Configuration**

  - [ ] `.mcp.json` contains `memory` and `fetch` servers.
  - [ ] `memory` server is configured correctly (standard `npx` command).

- **Deprecation**

  - [ ] `.claude/tools/memory-cli.js` has deprecation notice.
  - [ ] `docs/memory/README.md` points to `TAXONOMY.md` and marks CLI as deprecated.
  - [ ] `docs/memory/TAXONOMY.md` exists and defines entities (`ProjectContext`, `LessonLearned`, etc.).

- **Agent Updates**

  - [ ] `.factory/droids/coder.md` includes Memory logging for errors.
  - [ ] `.factory/droids/code-reviewer.md` includes Memory consultation and lesson saving.
  - [ ] `.factory/AGENTS.md` lists `memory` and `fetch` in MCP servers.

- **Orchestrator Updates**

  - [ ] `.factory/orchestrator/runbook.md` uses `memory.create_entities` instead of `memory-cli.js`.
  - [ ] `.claude/orchestrator/runbook.md` uses `memory.create_entities` instead of `memory-cli.js`.
  - [ ] `.factory/droids/README.md` no longer suggests `memory-cli.js gc`.

- **Verification**
  - [ ] Run a test task and verify Memory entities are created (if possible).
