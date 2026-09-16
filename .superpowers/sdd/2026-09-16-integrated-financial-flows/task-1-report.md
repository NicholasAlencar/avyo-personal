# Task 1 report: Clean reserve shield composition

## RED

Command:

```text
pnpm exec vitest run src/pages/EmergencyReservePage.test.jsx
```

Result: FAIL — 1 of 3 tests failed. The new test could not find an accessible `img` named `Progresso visual da reserva`, confirming the missing visual-group behavior.

## GREEN

Command:

```text
pnpm exec vitest run src/pages/EmergencyReservePage.test.jsx
```

Result: PASS — 1 test file passed; all 3 tests passed.

## Implementation

- Replaced the layered `ShieldCheck` icon and overlaid `<strong>` with one SVG composition.
- Added shield outline and progress stroke using a percentage clamped to 0–100.
- Added `role="img"` and `aria-label="Progresso visual da reserva"` to the SVG.
- Rendered the month value once inside the SVG `<text>` element.
- Added the required rendering regression test using `within`.

Files changed:

- `src/components/avyo/ReserveShield.jsx`
- `src/pages/EmergencyReservePage.test.jsx`

## Self-review

The implementation keeps the existing heading, currency summary, progress bar, deposit actions, and edit action unchanged. The SVG uses the existing reserve values and clamps the visual progress safely for targets at or below zero and over-target balances. No `ShieldCheck` import or layered inner icon remains.

Commit: `4f118407bd1bea9cede3f8e37c1ce71e3756acf0`
