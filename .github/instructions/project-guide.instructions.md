---
applyTo: "**"
---

# 🔥 FIRE Calculator - Agent Development Guide

## Project Overview

This is a **pure client-side Financial Independence / Retire Early (FIRE) calculator** built with Next.js 14, TypeScript, and Tailwind CSS. The application simulates retirement scenarios based on user inputs and provides year-by-year projections of portfolio growth.

**Core Purpose:** Help users calculate when they can achieve financial independence and retire, modeling contribution phases, inflation, and portfolio withdrawals.

**Key Constraint:** NO backend, NO databases, NO localStorage, NO authentication. Everything runs client-side.

---

## Tech Stack

### Primary Technologies
- **Next.js 14** (App Router, client-side only)
- **React 18** (with hooks: useState, useEffect, useMemo)
- **TypeScript 5** (strict mode)
- **Tailwind CSS 3** (with dark mode support)
- **Recharts 2** (for portfolio visualization)

### Development Tools
- **Jest** (unit testing)
- **Testing Library** (React component testing)
- **ESLint** (code linting)
- **GitHub Actions** (CI/CD to GitHub Pages)

### Important: NO Server-Side Rendering
- All components are client-side only (`"use client"` directive)
- No SSR dependencies in calculation logic
- URL parameters used for state persistence (no localStorage)

---

## Architecture & Design Principles

### 1. Pure Calculation Engine (`lib/finance.ts`)

**CRITICAL:** The calculation engine is a **pure function** with ZERO React dependencies.

```typescript
// ✅ GOOD: Pure function, testable independently
export function simulateRetirement(inputs: RetirementInputs): SimulationResult {
  // Deterministic calculations only
}

// ❌ BAD: Don't add React hooks or dependencies
// Don't use: useState, useEffect, useContext, etc.
```

**Benefits:**
- Fully testable with unit tests
- No React re-render concerns
- Can be extracted/reused elsewhere
- Clear separation of business logic from UI

### 2. Component Architecture

```
app/page.tsx                    # Entry point (Suspense wrapper)
└── Calculator.tsx              # Main orchestrator (state management, URL sync)
    ├── SegmentedControl.tsx    # Preset selector
    ├── InputsForm.tsx          # User input form
    │   ├── NumberInput.tsx     # Reusable number input with increment/decrement
    │   ├── CurrencyInput.tsx   # Currency input with formatting
    │   └── InfoTooltip.tsx     # Help tooltips
    ├── ResultsSummary.tsx      # Key metrics display (cards)
    ├── PortfolioChart.tsx      # Recharts visualization
    └── YearlyTable.tsx         # Year-by-year breakdown table
```

### 3. State Management

**Local State Only** - using React hooks:
- `useState` for form inputs
- `useMemo` for expensive calculations (memoization)
- `useEffect` for side effects (URL sync, dark mode)

**URL as Source of Truth:**
- All inputs are encoded to URL query params
- Enables sharing scenarios via URL
- No localStorage = no privacy concerns
- See `lib/urlState.ts` for encoding/decoding logic

### 4. Type Safety

**All types defined in `lib/types.ts`:**
- `RetirementInputs` - All user inputs
- `SimulationResult` - Calculation output
- `YearRow` - Single year in simulation
- `ContributionPhase` - Contribution period definition
- Union types for enums: `"monthly" | "yearly"`, `"nominal" | "real"`

**No `any` types allowed.** Always use explicit types.

---

## File Structure & Responsibilities

### `/lib` - Core Business Logic
- **`finance.ts`** - Pure calculation engine (NO React imports)
  - `simulateRetirement()` - Main simulation function
  - `calculateYearlyContribution()` - Phase-aware contribution logic
  - `calculateGrowth()` - Compounding calculations
- **`types.ts`** - All TypeScript type definitions
- **`presets.ts`** - Default scenarios (Conservative, Balanced, Aggressive)
- **`urlState.ts`** - URL encoding/decoding for state persistence

### `/components` - React UI Components
- **`Calculator.tsx`** - Main component (state orchestration)
- **`InputsForm.tsx`** - Input form with phases management
- **`ResultsSummary.tsx`** - Results cards (FI target, retirement age, years)
- **`YearlyTable.tsx`** - Year-by-year breakdown table
- **`PortfolioChart.tsx`** - Recharts line/area chart
- **`SegmentedControl.tsx`** - Preset switcher
- **`NumberInput.tsx`** - Reusable number input with +/- buttons
- **`CurrencyInput.tsx`** - Currency input with comma formatting
- **`InfoTooltip.tsx`** - Help icon with tooltips

### `/app` - Next.js App Router
- **`page.tsx`** - Entry point with Suspense wrapper
- **`layout.tsx`** - Root layout with metadata
- **`globals.css`** - Global styles and CSS variables

### `/__tests__` - Tests
- **`finance.test.ts`** - Unit tests for calculation engine
- **`SegmentedControl.test.tsx`** - Component tests

---

## Key Calculation Logic

### Retirement Condition
User reaches FI when:
```typescript
portfolio >= (annualSpend / SWR) * bufferMultiplier
```

### Inflation Modes
- **Nominal:** Uses raw expected return, spending inflates yearly
- **Real:** `effectiveReturn = expectedReturn - inflationRate`, spending is in "today's dollars"

### Compounding
- **Yearly:** `growth = portfolio × yearlyReturn`
- **Monthly:** `finalValue = portfolio × (1 + monthlyReturn)^12`

### Contribution Phases
- Users can define multiple phases (e.g., working years, part-time, sabbatical)
- Phases can overlap (contributions stack additively)
- Phases can extend beyond retirement age
- When current age changes, phase ages shift intelligently

---

## Development Workflow

### Running the Dev Server
```bash
npm run dev          # Starts dev server at http://localhost:3000
```

### Running Tests
```bash
npm test             # Run all tests once
npm run test:watch   # Run tests in watch mode
```

### Building for Production
```bash
npm run build        # Creates static export in /out directory
```

### Linting
```bash
npm run lint         # Run ESLint
```

---

## Common Development Tasks

### Adding a New Input Field

1. **Update type** in `lib/types.ts` (`RetirementInputs`)
2. **Update calculation** in `lib/finance.ts` if needed
3. **Add to form** in `components/InputsForm.tsx`
4. **Update URL encoding** in `lib/urlState.ts` (both encode and decode)
5. **Update default** in `lib/presets.ts` (`DEFAULT_INPUTS`)
6. **Update presets** if field affects preset comparison in `Calculator.tsx`
7. **Add tests** in `__tests__/finance.test.ts`

### Adding a New Preset

1. **Add entry** in `lib/presets.ts` (`PRESETS` object)
2. **Ensure proper fields** are set (return %, inflation, SWR, buffer, etc.)
3. **Test** that preset switching works correctly

### Modifying Calculation Logic

1. **ALWAYS update** `lib/finance.ts` first (pure function)
2. **Write/update tests** in `__tests__/finance.test.ts`
3. **Run tests** to ensure no regressions
4. **Test in UI** for edge cases

### Styling Changes

- Use **Tailwind utility classes** (no custom CSS unless necessary)
- Support **dark mode** with `dark:` prefix
- Follow existing color scheme:
  - Primary: Blue (`blue-600`, `blue-700`, etc.)
  - Success: Green (`green-600`)
  - Warning: Yellow (`yellow-600`)
  - Background: Gray (`gray-50` light, `gray-900` dark)
- Maintain **high contrast** for accessibility

### Visual Verification

When dealing with UI/layout issues:
1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000` in browser or Playwright
3. Take screenshots/snapshots to verify current state
4. Make changes
5. Verify changes visually before completing task

---

## Code Style & Conventions

### TypeScript
- Use **explicit types** everywhere
- NO `any` types
- Use **union types** for enums: `"monthly" | "yearly"`
- Prefer **interfaces** for object shapes
- Use **optional properties** (`?`) when appropriate

### React
- Use **function components** (no class components)
- Use **hooks**: `useState`, `useEffect`, `useMemo`
- **Memoize** expensive calculations with `useMemo`
- Always include **dependency arrays** in `useEffect`/`useMemo`
- Use **`"use client"`** directive at top of all component files

### Functions
- Prefer **pure functions** for calculations
- Use **arrow functions** for inline callbacks
- Use **descriptive names** (e.g., `handleCurrentAgeChange` not `onChange`)
- Keep functions **focused** and **single-purpose**

### Naming Conventions
- **Components:** PascalCase (`InputsForm`, `PortfolioChart`)
- **Files:** PascalCase for components, camelCase for utilities
- **Functions:** camelCase (`simulateRetirement`, `calculateGrowth`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_INPUTS`, `PRESETS`)
- **Types/Interfaces:** PascalCase (`RetirementInputs`, `YearRow`)

### Comments
- Use **JSDoc** for function documentation
- Explain **WHY** not WHAT (code should be self-documenting)
- Add comments for **complex calculations** or **non-obvious logic**

---

## Testing Guidelines

### Unit Tests (`__tests__/finance.test.ts`)
- Test **calculation engine** thoroughly
- Test **edge cases**: zero values, negative values, boundary conditions
- Test **inflation modes**: nominal vs real
- Test **compounding**: monthly vs yearly
- Test **contribution phases**: overlapping, gaps, beyond retirement
- Use **descriptive test names**: `"should calculate retirement age correctly"`

### Component Tests
- Test **user interactions**: button clicks, input changes
- Test **rendering**: correct display of values
- Test **state changes**: preset switching, dark mode
- Use **Testing Library** best practices

### What to Test
✅ Pure calculation functions
✅ Component rendering logic
✅ User interaction handlers
✅ Edge cases and boundary conditions

❌ Don't test implementation details
❌ Don't test third-party libraries (Recharts, Next.js)

---

## Deployment

### GitHub Actions CI/CD

Three workflows in `.github/workflows/`:
1. **`build-test.yml`** - Runs on all PRs (build + test)
2. **`pr.yml`** - Additional PR checks
3. **`deploy.yml`** - Deploys to GitHub Pages on push to `main`

### GitHub Pages Setup
- Site deployed to: `https://[username].github.io/FIRE-Calculator/`
- Automatic deployment on push to `main`
- Static export from Next.js (in `/out` directory)
- `.nojekyll` file required for GitHub Pages

### Manual Deployment
```bash
npm run build    # Exports to /out directory
# Upload /out to any static hosting
```

---

## Important Constraints & Rules

### NEVER Add:
- ❌ Backend/API routes
- ❌ Database connections
- ❌ localStorage or sessionStorage
- ❌ Authentication/authorization
- ❌ Server-side rendering dependencies in core logic
- ❌ External API calls (keep everything deterministic)

### ALWAYS:
- ✅ Keep calculation logic pure and testable
- ✅ Maintain TypeScript strict mode
- ✅ Support dark mode in UI changes
- ✅ Update URL encoding when adding inputs
- ✅ Write tests for calculation changes
- ✅ Preserve responsiveness (mobile + desktop)
- ✅ Follow existing code patterns and style

### Performance:
- ✅ Use `useMemo` for expensive calculations
- ✅ Limit table rendering (pagination for large datasets)
- ✅ Avoid unnecessary re-renders (proper dependency arrays)

---

## Troubleshooting

### "Hydration error" or SSR issues
- Ensure all components have `"use client"` directive
- Check that no server-side code is in client components
- Verify Suspense boundaries are correct

### Calculation results incorrect
- Check `lib/finance.ts` logic
- Verify inflation mode handling
- Check compounding interval calculations
- Run unit tests to isolate issue

### URL parameters not working
- Check `lib/urlState.ts` encoding/decoding
- Ensure new fields are added to both functions
- Verify default values are set

### Dark mode not applying
- Check `darkMode` state in `Calculator.tsx`
- Verify `dark:` classes in Tailwind
- Ensure `tailwind.config.ts` has `darkMode: 'class'`

---

## Questions to Ask Before Making Changes

1. **Does this affect calculation logic?** → Update `finance.ts` + tests
2. **Does this add a new input?** → Update types, form, URL encoding, presets
3. **Does this change UI?** → Support dark mode, maintain responsiveness
4. **Does this affect state?** → Update URL encoding for shareability
5. **Is this testable?** → Add/update tests appropriately

---

## Useful Resources

- **Requirements:** See `requirements.md` for full functional spec
- **Implementation Notes:** See `IMPLEMENTATION_NOTES.md` for detailed architecture decisions
- **README:** See `README.md` for user-facing documentation
- **Tests:** See `__tests__/` for testing examples

---

## Summary for Quick Reference

**What is this?** Client-side FIRE calculator with Next.js + TypeScript
**Key Principle:** Pure calculation engine, client-side only, no persistence
**Main Files:**
- Logic: `lib/finance.ts`
- Types: `lib/types.ts`
- Main UI: `components/Calculator.tsx`
- Input Form: `components/InputsForm.tsx`

**When making changes:** Update types → Update logic → Update UI → Update tests → Update URL encoding
**Before committing:** Run tests (`npm test`), run linting (`npm run lint`), verify dark mode
**For visual changes:** Use Playwright to verify at `http://localhost:3000`
