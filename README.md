# FIRE Calculator

A pure client-side Financial Independence / Retire Early (FIRE) calculator built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Pure Client-Side**: No backend, databases, or localStorage
- **Real-time Calculations**: Instant updates as you adjust inputs
- **Contribution Phases**: Model multiple contribution periods throughout your career
- **Inflation Modes**: Toggle between nominal and real (inflation-adjusted) returns
- **Visual Analytics**: Interactive charts showing portfolio growth over time
- **Scenario Sharing**: Save and share scenarios via URL parameters
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Preset Scenarios**: Quick-start with Conservative, Balanced, or Aggressive plans

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
fire-calculator/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main calculator page
│   └── globals.css         # Global styles
├── components/
│   ├── InputsForm.tsx      # Input form component
│   ├── ResultsSummary.tsx  # Results summary cards
│   ├── YearlyTable.tsx     # Year-by-year breakdown table
│   └── PortfolioChart.tsx  # Portfolio visualization chart
├── lib/
│   ├── types.ts            # TypeScript type definitions
│   ├── finance.ts          # Pure calculation engine
│   ├── presets.ts          # Preset scenarios
│   └── urlState.ts         # URL state management
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## How It Works

### Calculation Engine

The core simulation logic is in `lib/finance.ts`. It's a pure function with no React dependencies:

```typescript
simulateRetirement(inputs: RetirementInputs): SimulationResult
```

This function:
1. Runs a year-by-year simulation starting from current age
2. Applies contributions based on defined phases
3. Calculates compound growth (monthly or yearly)
4. Determines when retirement condition is met
5. Applies withdrawals post-retirement
6. Returns retirement age, FI target, and yearly breakdown

### Retirement Condition

Retirement is triggered when:

```
portfolio >= (annualSpend / SWR) * bufferMultiplier
```

Where:
- **annualSpend** = monthlyRetirementSpend × 12
- **SWR** = Safe Withdrawal Rate (typically 3-5%)
- **bufferMultiplier** = Safety buffer (1.0-1.25×)

### Inflation Modes

**Real Mode** (default):
- Adjusts returns for inflation: `effectiveReturn = return - inflation`
- Retirement spending is in today's dollars
- More conservative and realistic

**Nominal Mode**:
- Uses raw return rate
- Does not adjust for inflation
- Shows higher absolute numbers

## Key Assumptions

1. **Constant Returns**: The calculator assumes consistent annual returns (no volatility)
2. **No Taxes**: Does not account for tax implications of contributions or withdrawals
3. **No Asset Allocation**: Single blended return rate
4. **Deterministic**: No Monte Carlo simulation or probability ranges
5. **Max 100 Years**: Simulation stops after 100 years
6. **Annual Withdrawals**: Withdrawals occur once per year
7. **Immediate Retirement**: User retires as soon as FI target is reached

## Edge Cases Handled

- **Never Reaching FI**: Displays "Never" if retirement isn't achievable in 100 years
- **Multiple Contribution Phases**: Supports career changes, salary increases, etc.
- **Portfolio Depletion**: Stops simulation if portfolio goes negative
- **Invalid Inputs**: Form validation prevents negative or unrealistic values
- **URL Decode Errors**: Falls back to default preset if URL params are invalid

## Customization

### Adding New Presets

Edit `lib/presets.ts`:

```typescript
export const PRESETS: Record<string, Preset> = {
  myPreset: {
    name: "My Custom Preset",
    inputs: {
      currentAge: 25,
      // ... other inputs
    },
  },
};
```

### Modifying Calculation Logic

The calculation engine in `lib/finance.ts` is fully self-contained and can be customized without affecting the UI.

## Browser Support

- Modern browsers with ES2020+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## License

MIT

## Disclaimer

This calculator is for educational and planning purposes only. It does not constitute financial advice. Consult with a qualified financial advisor for personalized guidance.

## Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- Calculations remain deterministic and testable
- UI stays responsive and accessible
- No backend dependencies are introduced
