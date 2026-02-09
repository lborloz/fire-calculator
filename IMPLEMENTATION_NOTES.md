# Implementation Notes

## Architecture Decisions

### Pure Calculation Engine

The calculation logic is completely separated from React/UI concerns:

**✅ Benefits:**
- Easily testable with unit tests
- Can be used in other contexts (CLI, API, etc.)
- No React re-render concerns
- Clear separation of concerns

**Implementation:**
```typescript
// lib/finance.ts - No React imports
export function simulateRetirement(inputs: RetirementInputs): SimulationResult {
  // Pure calculations
}
```

### State Management

**Local State Only:**
- Uses React's `useState` and `useMemo` hooks
- No external state management library needed
- State is serializable to URL params

**URL as Source of Truth:**
- Entire scenario encoded in query string
- Enables easy sharing and bookmarking
- No localStorage means no privacy concerns

### Performance Optimizations

1. **Memoization**: Results are memoized with `useMemo` to prevent unnecessary recalculations
2. **Table Pagination**: Only first 50 rows displayed by default
3. **Efficient Re-renders**: Components only re-render when their specific props change

### TypeScript Strictness

All TypeScript types are explicit and strict:
- No `any` types
- Full type safety across calculation engine
- Union types for enums (`"monthly" | "yearly"`)

## Calculation Details

### Compounding Formula

**Yearly Compounding:**
```
growth = portfolio × yearlyReturn
```

**Monthly Compounding:**
```
monthlyReturn = yearlyReturn / 12
finalValue = portfolio × (1 + monthlyReturn)^12
growth = finalValue - portfolio
```

### Contribution Phase Logic

Phases are processed in sorted order by start age. For each year:

```typescript
if (age >= phase.startAge && age < (phase.endAge ?? retirementAge ?? ∞)) {
  apply phase.monthlyContribution
}
```

Multiple overlapping phases stack additively.

### FI Target Calculation

```
fiTarget = (annualSpend / SWR) × bufferMultiplier
```

**Example:**
- Monthly spend: $4,000
- Annual spend: $48,000
- SWR: 4% (0.04)
- Buffer: 1.0×
- **FI Target: $1,200,000**

### Real vs Nominal Returns

**Inflation Mode = Real:**
```
effectiveReturn = expectedReturn - inflationRate
// Example: 7% - 3% = 4% real return
```

The spending amount is treated as "today's dollars" and doesn't inflate over time.

**Inflation Mode = Nominal:**
```
effectiveReturn = expectedReturn
// Example: 7% nominal return
```

Spending is fixed in nominal terms (doesn't adjust for inflation).

## UI/UX Decisions

### Input Grouping

Inputs are organized into logical sections:
1. **User Profile**: Basic info (age)
2. **Financial Inputs**: Return rates, spending, withdrawal rate
3. **Contribution Phases**: Career contribution modeling

### Visual Feedback

- **Green highlighting**: Retirement years in table
- **Color-coded metrics**: Blue (age), Green (target), Purple (years)
- **Warning messages**: Yellow alert if FI not achievable

### Charts

Using Recharts for visualization:
- **Stacked Area Chart**: Shows contribution vs growth separation
- **Interactive Tooltips**: Hover for detailed year info
- **Retirement Marker**: Visual indicator of retirement milestone

### Responsive Design

- **Mobile**: Single column layout
- **Desktop**: Two-column (inputs left, results right)
- **Sticky Sidebar**: Inputs stay visible while scrolling results

## Edge Cases & Assumptions

### Edge Case: Never Reaching Retirement

If FI target isn't reached within 100 years:
- `retirementAge = null`
- `yearsToRetirement = null`
- Warning message displayed
- Table still shows all accumulation years

### Edge Case: Portfolio Depletion

If withdrawals exceed portfolio and it goes negative:
- Simulation stops immediately
- Table shows years up to depletion
- User should adjust inputs

### Edge Case: Start Age After Current Age

Phases with `startAge < currentAge` are skipped automatically.

### Edge Case: Overlapping Phases

Multiple phases can overlap. Contributions are summed:

```typescript
// Phase 1: Age 30-40, $2,000/month
// Phase 2: Age 35-45, $1,000/month
// At age 37: Total = $3,000/month
```

### Assumption: Phase End Age

If `endAge` is `undefined`, phase continues until retirement:

```typescript
{
  startAge: 30,
  endAge: undefined,  // Runs until retirement
  monthlyContribution: 2000
}
```

### Assumption: Annual Withdrawals

Withdrawals happen once per year (at year end), not monthly. This is simpler and doesn't significantly affect long-term projections.

### Assumption: No Sequence Risk

Returns are applied uniformly each year. In reality, the sequence of returns matters (especially early in retirement). This calculator doesn't model sequence risk.

## Testing Recommendations

### Unit Tests for Calculation Engine

```typescript
describe('simulateRetirement', () => {
  test('reaches FI with sufficient contributions', () => {
    const result = simulateRetirement({...});
    expect(result.retirementAge).toBe(45);
  });

  test('handles never reaching FI', () => {
    const result = simulateRetirement({...});
    expect(result.retirementAge).toBeNull();
  });
});
```

### Integration Tests for UI

- Test preset loading
- Test URL state encoding/decoding
- Test form input updates
- Test chart rendering
- Test table display

## Future Enhancements (Out of Scope)

These were explicitly excluded but could be added later:

1. **Monte Carlo Simulation**: Probability-based outcomes
2. **Tax Modeling**: Pre-tax vs post-tax accounts
3. **Social Security**: Additional retirement income
4. **Healthcare Costs**: Separate healthcare inflation
5. **Asset Allocation**: Multiple asset classes with different returns
6. **Sequence Risk**: Variable returns simulation
7. **User Accounts**: Save multiple scenarios server-side
8. **Historical Backtesting**: Test against historical market data

## Deployment

This is a pure client-side app and can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **GitHub Pages** (via `next export`)
- **Any static host**

Build command:
```bash
npm run build
```

Output is in `.next/` directory (or `out/` if using static export).

## Browser Compatibility

Relies on:
- ES2020+ features
- CSS Grid and Flexbox
- URLSearchParams API
- Intl.NumberFormat API

All supported in modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+).
