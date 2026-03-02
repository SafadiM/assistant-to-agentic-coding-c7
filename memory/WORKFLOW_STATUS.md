# Workflow and Status

This document defines the process stages, work item structure, and how status is tracked. It is the single source of truth for the assistant and developers on how to move work through the pipeline.

---

## 1. Process Stages

Work moves through the following stages. Each stage has required inputs, outputs, and rules for transitioning to the next.

| Stage | Purpose |
|-------|---------|
| **Backlog** | Captured idea or request; not yet scoped or committed. |
| **Ready** | Scoped, accepted, and ready to be picked up. |
| **In progress** | Actively being worked on. |
| **Review / Testing** | Implementation complete; verifying acceptance criteria. |
| **Done** | Criteria met, merged or shipped; work item can be archived. |

### 1.1 Stage details

**Backlog**

- **Inputs**: Raw request, link or one-line description.
- **Outputs**: Work item file in `changes/` with at least title and short description; optional rough acceptance criteria.
- **Transition to Ready**: Work item has clear scope, acceptance criteria, and optional task list. Decision to do it is made.

**Ready**

- **Inputs**: Work item file with acceptance criteria and (recommended) task list.
- **Outputs**: Same file; no code changes required.
- **Transition to In progress**: Someone starts work; update work item status to *In progress* and set *Started* date if used.

**In progress**

- **Inputs**: Work item in Ready state; branch or workspace for changes.
- **Outputs**: Code and/or docs; work item file updated (tasks checked off, notes added as needed).
- **Transition to Review / Testing**: All tasks in the work item are done; implementation is committed. Run build/test protocol (see §4). Update status to *Review / Testing*.

**Review / Testing**

- **Inputs**: Implementation complete; build and tests passing (or documented exception).
- **Outputs**: Acceptance criteria verified (see §3); any follow-up bugs or small tweaks done.
- **Transition to Done**: All acceptance criteria met and validated. Merge (or mark shipped). Update status to *Done*. Optionally move work item to an archive or leave in `changes/` with *Done*.

**Done**

- **Inputs**: Merged/shipped work; criteria validated.
- **Outputs**: No further transitions; work item remains for history. Can be purged later if desired.

### 1.2 Rules for transitioning

- Move forward only when the current stage’s outputs are satisfied.
- If scope or criteria change, update the work item file and, if necessary, move back to Ready or Backlog.
- Do not skip stages (e.g. Ready → Done) unless explicitly deciding to cancel or collapse the item.

---

## 2. Work Item / Story File Structure

Work items live under `changes/` as one file per item. Prefer a short, kebab-case name and optional number for ordering.

**Example filename:** `changes/001-first_story.md` or `changes/add-export-feature.md`.

### 2.1 Required sections

- **Title** — One line; matches the intent of the work.
- **Status** — One of: `Backlog` | `Ready` | `In progress` | `Review / Testing` | `Done`.
- **Acceptance criteria** — List of conditions that must hold for the item to be Done (see §3).

### 2.2 Optional sections

- **Description** — Brief context or problem statement.
- **Tasks** — Checklist of concrete steps; check off as done; can be purged or simplified after completion.
- **Notes / Decisions** — Ad-hoc notes, links to PRs, or decisions made during the work. Can be pruned after Done.
- **Started / Completed** — Dates if you want to track timing.

### 2.3 Example structure

```markdown
# Title of the work item

**Status:** In progress

## Description
Short context or problem statement.

## Acceptance criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Tasks
- [x] Task 1
- [ ] Task 2

## Notes
(Optional; purge or summarize after Done.)
```

Keep the file focused: avoid duplicating long specs that live elsewhere; link to other docs or issues instead.

---

## 3. Acceptance Criteria: Format and Validation

### 3.1 Format

- Use a **bullet list** of clear, testable conditions.
- Each criterion is one short sentence or a short Given/When/Then line.
- Optionally use checkboxes: `- [ ] Criterion` and check when verified.

**Examples:**

- `- [ ] GET /configs returns 200 and a JSON array when the DB has configs.`
- `- [ ] User can create a config from the UI and see it in the list.`
- `- [ ] Given a valid key, when I request GET /configs/:key, then I receive 200 and the config JSON.`

### 3.2 Validation

- **Automated**: If a criterion is covered by tests (unit, integration, or E2E), running the test suite counts as validation. Document in the work item or in TESTING.md which tests cover which criteria when it’s non-obvious.
- **Manual**: If a criterion is demo-only (e.g. “UI looks correct”), say so in the work item; validation is “run the app and confirm.”
- **Definition of met**: A criterion is met when it has been validated (automated or manual) and any discovered issues are fixed. All criteria must be met before transitioning to Done.

No separate “acceptance criteria format validator” is required; the team (and assistant) use the checklist and the build/test protocol to decide when the item is done.

---

## 4. Where Status Is Maintained

- **High-level status** (current stage) is stored **in the work item file** under `changes/`, in the **Status** field.
- **This file** (`memory/WORKFLOW_STATUS.md`) describes the process and the work item structure; it does **not** list every work item or duplicate their status.
- **Active work item**: The current work item is tracked in `changes/ACTIVE.md`, which contains only the path to the active item (e.g. `changes/001-first_story.md`). When starting new work, update this pointer. When work is Done, clear it or point to the next item. The assistant should read `changes/ACTIVE.md` when asked "what's the next step?" or "what's our status?"

Avoid duplicating task-level or criterion-level detail in other memory files; keep that in the work item file so there is one place to update.

---

## 5. Protocol Around Building and Testing

- **Before transitioning to Review / Testing**: Run the relevant build and test commands for the areas you changed. Use the scripts in `memory/ENV_SCRIPTS.md` (e.g. `yarn test` and `yarn lint` in config-service, `pnpm test` and `pnpm lint` in config-client and ui). Fix failures or document why they are acceptable for this change.
- **Before transitioning to Done**: All acceptance criteria must be validated and build/test must pass (or an explicit exception noted in the work item).
- **Pre-commit hooks**: The backend has husky + lint-staged; lint and format run automatically on `git commit`. If the hook rejects the commit, fix the errors and commit again. See `memory/ENV_SCRIPTS.md` §3.5 for details.
- **Acceptable to not address**: It is acceptable to merge or mark Done with known limitations (e.g. “E2E not run”, “known flaky test skipped”) only if:
  - The limitation is **documented** in the work item or in memory (e.g. TESTING.md), and
  - There is a **follow-up** task or work item to address it, or a conscious decision to defer.

Do not leave the pipeline in “Review / Testing” or “Done” with unacknowledged failing tests or broken build; either fix, or document and create follow-up work.


## 6. Getting Started

The `changes/` directory and `changes/ACTIVE.md` must exist before creating the first work item. Create them when adopting this workflow:

```sh
mkdir -p changes
echo "" > changes/ACTIVE.md
```

---

*Update this file when you change stages, work item structure, or build/test policy.*
