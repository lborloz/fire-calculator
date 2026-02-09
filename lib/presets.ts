/**
 * Predefined preset scenarios
 */

import { Preset, RetirementInputs } from "./types";

export const PRESETS: Record<string, Preset> = {
  balanced: {
    name: "Balanced",
    inputs: {
      currentAge: 30,
      lifeExpectancy: 90,
      initialInvestment: 50000,
      monthlyRetirementSpend: 4000,
      expectedYearlyReturn: 10,
      inflationRate: 3,
      compoundingInterval: "monthly",
      safeWithdrawalRate: 4,
      retirementBufferMultiplier: 1.0,
      contributionPhases: [
        {
          startAge: 30,
          endAge: undefined,
          monthlyContribution: 2000,
        },
      ],
      inflationMode: "real",
    },
  },
  conservative: {
    name: "Conservative",
    inputs: {
      currentAge: 25,
      lifeExpectancy: 90,
      initialInvestment: 25000,
      monthlyRetirementSpend: 3500,
      expectedYearlyReturn: 7,
      inflationRate: 3,
      compoundingInterval: "monthly",
      safeWithdrawalRate: 3.5,
      retirementBufferMultiplier: 1.2,
      contributionPhases: [
        {
          startAge: 25,
          endAge: undefined,
          monthlyContribution: 1500,
        },
      ],
      inflationMode: "real",
    },
  },
  aggressive: {
    name: "Aggressive",
    inputs: {
      currentAge: 35,
      lifeExpectancy: 90,
      initialInvestment: 100000,
      monthlyRetirementSpend: 5000,
      expectedYearlyReturn: 12,
      inflationRate: 3,
      compoundingInterval: "monthly",
      safeWithdrawalRate: 4.5,
      retirementBufferMultiplier: 1.0,
      contributionPhases: [
        {
          startAge: 35,
          endAge: 45,
          monthlyContribution: 3000,
        },
        {
          startAge: 45,
          endAge: undefined,
          monthlyContribution: 4000,
        },
      ],
      inflationMode: "real",
    },
  },
};

export const DEFAULT_INPUTS: RetirementInputs = PRESETS.balanced.inputs;
