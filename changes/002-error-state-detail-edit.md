# Add error state UI to detail and edit views

**Status:** Done

## Description

When `loadConfig()` fails (404, network error, etc.), the detail and edit views give no useful feedback. ConfigDetail shows "Config not found." with no way to navigate back. ConfigForm in edit mode silently renders an empty form. The `error` state already exists in the store (`useConfigs`) but neither component reads it.

## Acceptance criteria

- [x] ConfigDetail shows a clear error message and a "Back to list" button when `loadConfig` fails
- [x] ConfigForm (edit mode) shows a clear error message and a "Back to list" button when `loadConfig` fails
- [x] The error state uses appropriate styling (not the `loading` CSS class)
- [x] Existing behavior is unchanged when configs load successfully
- [x] Unit tests cover the error state for both components
- [x] Existing tests continue to pass

## Tasks

- [x] Update ConfigDetail to read `error` from `useConfigs` and render error UI with back button
- [x] Update ConfigForm to read `error` from `useConfigs` and render error UI with back button in edit mode
- [x] Add CSS for error state styling
- [x] Add unit tests for error states in both components
- [x] Run full test suite and lint

## Notes

- No store changes needed — `error` was already tracked in `useConfigs`; components just weren't using it.
- ConfigForm required careful hook ordering: the early return for error state had to be placed after all `useEffect` calls to satisfy React's rules of hooks.
- The `.error-state` CSS class is defined in `ConfigDetail.css` and applies globally (Vite injects CSS globally, not as modules), so both components share the same styling.

## Stage tracking

The current stage is reflected by the **Status** field at the top of this file. Update it as work progresses through the stages defined in `memory/WORKFLOW_STATUS.md`.
