/**
 * Pure calculation engine for retirement simulation
 * No React dependencies - can be tested independently
 */

import {
  RetirementInputs,
  SimulationResult,
  YearRow,
  ContributionPhase,
  WithdrawalOverride,
} from "./types";

/**
 * Main simulation function
 * Runs a year-by-year simulation until retirement or max years
 */
export function simulateRetirement(
  inputs: RetirementInputs
): SimulationResult {
  const {
    currentAge,
    lifeExpectancy = 100, // Default to 100 if not provided (for backward compatibility with tests)
    initialInvestment,
    monthlyRetirementSpend,
    expectedYearlyReturn,
    inflationRate,
    compoundingInterval,
    safeWithdrawalRate,
    retirementBufferMultiplier,
    contributionPhases,
    withdrawalOverrides = [], // Default to empty array for backward compatibility
    inflationMode,
  } = inputs;

  // Calculate effective return based on inflation mode
  const effectiveReturnPercent =
    inflationMode === "real"
      ? expectedYearlyReturn - inflationRate
      : expectedYearlyReturn;

  // Convert percentages to decimals
  const effectiveReturn = effectiveReturnPercent / 100;
  const swr = safeWithdrawalRate / 100;

  // Calculate annual retirement spend
  const annualRetirementSpend = monthlyRetirementSpend * 12;

  // Calculate FI target
  const fiTarget =
    (annualRetirementSpend / swr) * retirementBufferMultiplier;

  // Initialize simulation
  let portfolio = initialInvestment;
  let totalContributionsMade = initialInvestment;
  let retirementAge: number | null = null;
  let retired = false;
  const rows: YearRow[] = [];

  // Sort phases by startAge for easier processing
  const sortedPhases = [...contributionPhases].sort(
    (a, b) => a.startAge - b.startAge
  );
  const sortedOverrides = [...withdrawalOverrides].sort(
    (a, b) => a.startAge - b.startAge
  );

  // Run yearly simulation until life expectancy
  const maxYears = lifeExpectancy - currentAge;
  for (let year = 0; year <= maxYears; year++) {
    const age = currentAge + year;

    // Determine if we've just reached retirement
    // Check based on the effective withdrawal rate for this age (including overrides)
    if (!retired) {
      const effectiveWithdrawalRate = getWithdrawalRate(age, sortedOverrides, swr);
      const fiTargetForThisAge = (annualRetirementSpend / effectiveWithdrawalRate) * retirementBufferMultiplier;
      
      if (portfolio >= fiTargetForThisAge) {
        retired = true;
        retirementAge = age;
      }
    }

    // Calculate annual contribution for this year (phases can extend past retirement)
    const annualContribution = calculateYearlyContribution(age, sortedPhases);

    // Add contributions to portfolio
    portfolio += annualContribution;
    totalContributionsMade += annualContribution;

    // Calculate growth for the year
    const growth = calculateGrowth(
      portfolio,
      effectiveReturn,
      compoundingInterval
    );
    portfolio += growth;

    // Calculate withdrawal (only if retired)
    // Always use percentage-based withdrawal
    let withdrawal = 0;
    if (retired) {
      const effectiveWithdrawalRate = getWithdrawalRate(age, sortedOverrides, swr);
      withdrawal = portfolio * effectiveWithdrawalRate;
    }
    portfolio -= withdrawal;

    // Record this year
    rows.push({
      age,
      contribution: annualContribution,
      totalContributions: totalContributionsMade,
      growth,
      withdrawal,
      portfolioEnd: portfolio,
      retired,
    });

    // Check for failure (portfolio depleted)
    if (portfolio < 0) {
      break;
    }
  }

  const yearsToRetirement =
    retirementAge !== null ? retirementAge - currentAge : null;

  return {
    retirementAge,
    fiTarget,
    yearsToRetirement,
    rows,
  };
}

/**
 * Calculate yearly contribution based on active phases
 */
function calculateYearlyContribution(
  age: number,
  phases: ContributionPhase[]
): number {
  let totalMonthlyContribution = 0;

  for (const phase of phases) {
    const startAge = phase.startAge;
    const endAge = phase.endAge ?? Infinity; // If no end age, continue indefinitely

    if (age >= startAge && age < endAge) {
      totalMonthlyContribution += phase.monthlyContribution;
    }
  }

  return totalMonthlyContribution * 12;
}

/**
 * Get the effective withdrawal rate for a given age
 * Checks for withdrawal overrides, falls back to base SWR
 */
function getWithdrawalRate(
  age: number,
  overrides: WithdrawalOverride[],
  baseSwr: number
): number {
  for (const override of overrides) {
    const startAge = override.startAge;
    const endAge = override.endAge ?? Infinity;

    if (age >= startAge && age < endAge) {
      return override.withdrawalRate / 100; // Convert percentage to decimal
    }
  }

  return baseSwr; // Return base SWR if no override applies
}

/**
 * Calculate portfolio growth for one year
 * Handles monthly vs yearly compounding
 */
function calculateGrowth(
  portfolio: number,
  yearlyReturn: number,
  interval: "monthly" | "yearly"
): number {
  if (interval === "yearly") {
    return portfolio * yearlyReturn;
  } else {
    // Monthly compounding
    const monthlyReturn = yearlyReturn / 12;
    const finalValue =
      portfolio * Math.pow(1 + monthlyReturn, 12);
    return finalValue - portfolio;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return value.toFixed(decimals) + "%";
}
