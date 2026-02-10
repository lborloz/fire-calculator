# FIRE Calculator - Financial Calculations Documentation

## Overview

This document provides a comprehensive explanation of all financial calculations used in the FIRE (Financial Independence, Retire Early) Calculator. All calculations are performed in `lib/finance.ts` as pure functions with no external dependencies.

---

## Core Calculation Flow

The simulator runs a **year-by-year projection** from the user's current age until their specified life expectancy or until the portfolio is depleted.

### Yearly Simulation Loop

For each year (age), the following steps occur **in order**:

1. **Check Retirement Eligibility**
2. **Add Contributions**
3. **Calculate Growth**
4. **Apply Withdrawals**
5. **Record Year Data**
6. **Check for Portfolio Depletion**

---

## 1. Retirement Eligibility Check

### Formula

For each age, the calculator determines if retirement is possible by checking if the portfolio can support the desired withdrawal rate.

```
effectiveWithdrawalRate = getWithdrawalRate(age, overrides, baseSWR)
fiTargetForThisAge = (annualRetirementSpend / effectiveWithdrawalRate) × bufferMultiplier
canRetire = portfolio ≥ fiTargetForThisAge
```

### Components

- **`effectiveWithdrawalRate`**: The withdrawal rate for this specific age
  - Uses override rate if one applies for this age
  - Otherwise uses base Safe Withdrawal Rate (SWR)
- **`annualRetirementSpend`**: Monthly retirement spend × 12
- **`bufferMultiplier`**: Safety buffer (1.0 = no buffer, 1.25 = 25% extra)
- **`fiTargetForThisAge`**: Required portfolio value to retire at this age

### Example

```
Monthly Spend: $4,000
Annual Spend: $4,000 × 12 = $48,000
Base SWR: 4% (0.04)
Override: 3.5% (0.035) for ages 60-65
Buffer: 1.0 (no buffer)

At age 59:
  effectiveWithdrawalRate = 0.04 (base)
  fiTarget = ($48,000 / 0.04) × 1.0 = $1,200,000

At age 60:
  effectiveWithdrawalRate = 0.035 (override)
  fiTarget = ($48,000 / 0.035) × 1.0 = $1,371,429
```

### Notes

- Retirement is triggered the **first year** the portfolio meets or exceeds the FI target
- Once retired, the status persists for all subsequent years
- Overrides can delay retirement by requiring a larger portfolio

---

## 2. Contribution Phases

### Formula

```
annualContribution = Σ(active phases' monthlyContribution) × 12
```

### Logic

For each age, the calculator sums all contribution phases that are active:

```
A phase is active if: age ≥ startAge AND age < endAge
```

- Phases **can overlap** (contributions stack additively)
- Phases **can have gaps** (no contribution in between)
- Phases **can extend past retirement** (continue contributing)
- `endAge = undefined` means the phase continues indefinitely
- **Negative contributions** represent withdrawals during accumulation

### Example

```
Phase 1: Ages 30-40, $1,000/month
Phase 2: Ages 35-50, $500/month

Age 32: $1,000/month = $12,000/year
Age 37: $1,000 + $500 = $1,500/month = $18,000/year
Age 45: $500/month = $6,000/year
Age 55: $0/month = $0/year
```

### Portfolio Update

```
portfolio = portfolio + annualContribution
totalContributionsMade = totalContributionsMade + annualContribution
```

---

## 3. Growth Calculation

Growth is applied **after** contributions are added to the portfolio.

### Effective Return Calculation

```
if inflationMode === "real":
  effectiveReturn = (expectedYearlyReturn - inflationRate) / 100
else:
  effectiveReturn = expectedYearlyReturn / 100
```

### Inflation Modes

- **Real Mode** (Recommended): Adjusts returns for inflation, treating spending as "today's dollars"
  - Example: 10% return - 3% inflation = 7% effective return
- **Nominal Mode**: Uses raw returns without adjustment
  - Example: 10% return = 10% effective return

### Compounding Intervals

#### Yearly Compounding

```
growth = portfolio × effectiveReturn
```

Example:
```
Portfolio: $100,000
Return: 7% (0.07)
Growth: $100,000 × 0.07 = $7,000
New Portfolio: $107,000
```

#### Monthly Compounding

```
monthlyReturn = effectiveReturn / 12
finalValue = portfolio × (1 + monthlyReturn)^12
growth = finalValue - portfolio
```

Example:
```
Portfolio: $100,000
Yearly Return: 12% (0.12)
Monthly Return: 0.12 / 12 = 0.01

finalValue = $100,000 × (1.01)^12 = $112,682.50
growth = $112,682.50 - $100,000 = $12,682.50
```

**Note**: Monthly compounding yields slightly higher returns due to compound interest.

### Portfolio Update

```
portfolio = portfolio + growth
```

---

## 4. Withdrawal Calculation

Withdrawals occur **only during retirement** and are calculated **after growth is applied**.

### Withdrawal Rate Logic

```
if retired:
  effectiveWithdrawalRate = getWithdrawalRate(age, overrides, baseSWR)
  withdrawal = portfolio × effectiveWithdrawalRate
else:
  withdrawal = 0
```

### Withdrawal Rate Overrides

The `getWithdrawalRate()` function checks if any override applies for the current age:

```
For each override:
  if age ≥ override.startAge AND age < override.endAge:
    return override.withdrawalRate / 100

Return baseSWR (if no override applies)
```

### Example Scenario

```
Base SWR: 4.0%
Override: 5.0% for ages 55-60 (higher early retirement spending)
Override: 3.5% for ages 70-80 (lower late retirement spending)

Age 54: Portfolio = $1,200,000
  Rate: 4.0% (base)
  Withdrawal: $1,200,000 × 0.04 = $48,000

Age 57: Portfolio = $1,300,000
  Rate: 5.0% (override)
  Withdrawal: $1,300,000 × 0.05 = $65,000

Age 75: Portfolio = $2,000,000
  Rate: 3.5% (override)
  Withdrawal: $2,000,000 × 0.035 = $70,000
```

### Key Behavior Changes (2024)

**Previous Behavior:**
- First year of retirement: Fixed amount (monthly spend × 12)
- Subsequent years: Percentage-based

**Current Behavior:**
- **All retirement years**: Percentage-based withdrawal
- Retirement eligibility is calculated based on the effective withdrawal rate for that age
- This allows for more accurate modeling with withdrawal overrides

### Portfolio Update

```
portfolio = portfolio - withdrawal
```

---

## 5. Portfolio Depletion

The simulation checks if the portfolio is depleted after each year:

```
if portfolio < 0:
  break simulation
```

This allows modeling scenarios where spending exceeds growth and contributions, leading to portfolio failure.

---

## Complete Year Calculation Example

### Inputs

```
Age: 55
Current Portfolio: $1,000,000
Contribution Phase: $500/month (ages 50-60)
Expected Return: 10%
Inflation Rate: 3%
Inflation Mode: Real
Compounding: Monthly
Base SWR: 4%
Withdrawal Override: 4.5% for ages 55-60
Retired: Yes (retired at age 54)
Monthly Retirement Spend: $4,000
Buffer Multiplier: 1.0
```

### Step-by-Step Calculation

#### Step 1: Check Retirement (Already Retired)
```
retired = true (already retired at 54)
```

#### Step 2: Add Contributions
```
annualContribution = $500/month × 12 = $6,000
portfolio = $1,000,000 + $6,000 = $1,006,000
```

#### Step 3: Calculate Growth
```
effectiveReturn = (10% - 3%) / 100 = 0.07
monthlyReturn = 0.07 / 12 = 0.005833
finalValue = $1,006,000 × (1.005833)^12 = $1,078,747
growth = $1,078,747 - $1,006,000 = $72,747
portfolio = $1,006,000 + $72,747 = $1,078,747
```

#### Step 4: Apply Withdrawal
```
effectiveWithdrawalRate = 0.045 (override applies)
withdrawal = $1,078,747 × 0.045 = $48,544
portfolio = $1,078,747 - $48,544 = $1,030,203
```

#### Step 5: Record Year
```
YearRow {
  age: 55
  contribution: $6,000
  totalContributions: (previous total + $6,000)
  growth: $72,747
  withdrawal: $48,544
  portfolioEnd: $1,030,203
  retired: true
}
```

---

## Key Formulas Summary

### FI Target (Display Only)
```
fiTarget = (monthlyRetirementSpend × 12 / baseSWR) × bufferMultiplier
```

### FI Target for Specific Age (Retirement Calculation)
```
effectiveRate = getWithdrawalRate(age, overrides, baseSWR)
fiTargetForAge = (monthlyRetirementSpend × 12 / effectiveRate) × bufferMultiplier
```

### Real vs Nominal Return
```
realReturn = expectedReturn - inflationRate
nominalReturn = expectedReturn
```

### Yearly Compounding
```
growth = portfolio × (return / 100)
```

### Monthly Compounding
```
monthlyReturn = yearlyReturn / 12
growth = portfolio × [(1 + monthlyReturn)^12 - 1]
```

### Retirement Withdrawal
```
effectiveRate = getWithdrawalRate(age, overrides, baseSWR)
withdrawal = portfolio × effectiveRate
```

---

## Important Notes

### Order of Operations

The order matters significantly:

1. ✅ **Correct**: Contributions → Growth → Withdrawals
2. ❌ **Wrong**: Growth → Contributions → Withdrawals (would apply growth to contributions from the same year)

### Contribution Treatment

- **Initial investment** is treated as the first contribution
- Contributions are added **before** growth calculation (they grow immediately)
- Negative contributions (withdrawals) reduce the portfolio before growth

### Withdrawal Overrides

- Overrides **replace** the base SWR, they don't add to it
- Multiple overlapping overrides: First matching override wins
- Overrides affect both:
  - Retirement eligibility calculation
  - Actual withdrawal amounts

### Edge Cases

- **Portfolio = $0**: Simulation continues with $0 portfolio
- **Portfolio < $0**: Simulation stops (portfolio depleted)
- **No contributions**: Portfolio grows/shrinks from initial investment only
- **Retirement with ongoing contributions**: Both can occur simultaneously
- **Negative growth** (portfolio loss): Possible if returns are negative

---

## Testing

All calculations are thoroughly tested in `__tests__/finance.test.ts`:

- ✅ FI target calculation
- ✅ Monthly vs yearly compounding
- ✅ Multiple contribution phases (including overlaps)
- ✅ Negative contributions (withdrawals)
- ✅ Retirement detection
- ✅ Buffer multiplier application
- ✅ Real vs nominal inflation modes
- ✅ Contributions after retirement
- ✅ Portfolio depletion
- ✅ Phases with no end age
- ✅ Withdrawal overrides (tested via integration)

---

## References

- **Safe Withdrawal Rate**: Based on the Trinity Study (1998) and subsequent research
- **4% Rule**: William Bengen's research (1994) on sustainable retirement withdrawal rates
- **Compound Interest**: Standard financial mathematics
- **Real vs Nominal Returns**: Inflation-adjusted vs non-adjusted returns

---

## Version History

- **v1.0** (Initial): Basic FI calculation with fixed first-year withdrawal
- **v2.0** (Current): Percentage-based withdrawals from year 1, with support for withdrawal rate overrides
