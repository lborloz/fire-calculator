/**
 * Type definitions for the FIRE Calculator
 */

export type CompoundingInterval = "monthly" | "yearly";
export type InflationMode = "nominal" | "real";
export type SpendInputType = "monthly" | "yearly";

/**
 * Contribution phase - defines a period during which user makes regular contributions
 */
export interface ContributionPhase {
  startAge: number;
  endAge?: number; // undefined = until retirement
  monthlyContribution: number;
}

/**
 * All inputs required for retirement simulation
 */
export interface RetirementInputs {
  // User profile
  currentAge: number;
  lifeExpectancy?: number; // Max age for simulation (default: 90 in UI, 100 in tests)

  // Financial inputs
  initialInvestment: number;
  monthlyRetirementSpend: number;
  expectedYearlyReturn: number; // as percentage (e.g., 7 for 7%)
  inflationRate: number; // as percentage (e.g., 3 for 3%)
  compoundingInterval: CompoundingInterval;
  safeWithdrawalRate: number; // as percentage (e.g., 4 for 4%)
  retirementBufferMultiplier: number; // 1.0 to 1.25

  // Contribution phases
  contributionPhases: ContributionPhase[];

  // Mode
  inflationMode: InflationMode;
}

/**
 * One row in the yearly simulation table
 */
export interface YearRow {
  age: number;
  contribution: number; // Annual contribution for this year
  totalContributions: number; // Cumulative contributions
  growth: number; // Growth for this year
  withdrawal: number; // Withdrawal for this year (0 before retirement)
  portfolioEnd: number; // Portfolio value at end of year
  retired: boolean; // Whether user is retired in this year
}

/**
 * Complete simulation results
 */
export interface SimulationResult {
  retirementAge: number | null; // null if never reaches retirement
  fiTarget: number; // Financial Independence target number
  yearsToRetirement: number | null; // null if never reaches retirement
  rows: YearRow[];
}

/**
 * Preset configurations
 */
export interface Preset {
  name: string;
  inputs: RetirementInputs;
}
