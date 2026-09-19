# Mock Search Quality Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with tests before implementation.

**Goal:** Make the no-API prototype behave consistently for arbitrary questions, selected mock models, cancellation, reduced motion, and project hygiene.

**Architecture:** Keep the existing React state machine and mock data boundary. Add a deterministic mock fallback for unknown text, pass selected model IDs through the mock search function, and use a request generation token so late async callbacks cannot update stopped or superseded searches.

**Tech Stack:** React 19, Vite 8, Vitest, Testing Library, Oxlint, Tailwind CSS 4, Framer Motion.

## Global Constraints

- Do not add real API calls or backend dependencies.
- Preserve existing visual design and preset scenarios.
- Keep model answer and summary shapes compatible with existing result components.
- New behavior must have focused tests before production changes.

### Task 1: Mock search service behavior

**Files:**
- Modify: `src/data/mockResults.js`
- Test: `src/__tests__/mockResults.test.js`

- [ ] Add tests for unknown query fallback, selected model filtering, and follow-up fallback.
- [ ] Run focused tests and confirm they fail for the missing behaviors.
- [ ] Add a generic deterministic mock answer/summary factory.
- [ ] Extend `simulateSearch(queryKey, onProgress, isFollowUp, selectedModels)` without breaking existing callers.
- [ ] Run focused tests and confirm they pass.

### Task 2: Search state cancellation and routing

**Files:**
- Modify: `src/hooks/useSearchStateMachine.js`
- Test: `src/__tests__/searchStateMachine.test.js`

- [ ] Add tests proving selected models are forwarded and stale callbacks are ignored after stop/new search.
- [ ] Run focused tests and confirm they fail.
- [ ] Add a ref-based search generation token and guard progress callbacks.
- [ ] Forward `selectedModels` to `simulateSearch` and invalidate active work on stop/reset.
- [ ] Run all state-machine tests and confirm they pass.

### Task 3: UI and lint cleanup

**Files:**
- Modify: `src/components/SummaryCard.jsx`
- Modify: `src/components/ResultsSection.jsx`
- Modify: `src/components/HeroSection.jsx`
- Modify: `src/components/ui/ai-input.jsx`
- Modify: `src/components/ui/button.jsx`
- Modify: `src/index.css`

- [ ] Remove unused props/variables and split the button variant export if required by lint.
- [ ] Add explicit reduced-motion behavior for the CSS and background animation entry points.
- [ ] Run lint and confirm no new warnings.

### Task 4: Documentation and verification

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`

- [ ] Replace Vite template README with project setup, mock behavior, and verification commands.
- [ ] Update project boundaries to state that API integration remains intentionally deferred.
- [ ] Run `npm run test`, `npm run lint`, `npm run build`, and `node scripts/smoke-api.mjs` where environment permits.

