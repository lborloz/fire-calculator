import {
  simulateRetirement,
  formatCurrency,
  formatPercent,
} from "../lib/finance";
import { RetirementInputs } from "../lib/types";

describe("Financial Calculations", () => {
  describe("simulateRetirement", () => {
    it("should calculate FI target based on SWR", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 0,
        monthlyRetirementSpend: 4000,
        expectedYearlyReturn: 7,
        inflationRate: 3,
        inflationMode: "real",
        compoundingInterval: "yearly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1,
        contributionPhases: [],
      };

      const result = simulateRetirement(inputs);

      // FI target = (4000 * 12) / 0.04 * 1 = $1,200,000
      expect(result.fiTarget).toBeCloseTo(1200000, 0);
    });

    it("should handle monthly compounding correctly", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 100000,
        monthlyRetirementSpend: 3000,
        expectedYearlyReturn: 12,
        inflationRate: 0,
        inflationMode: "nominal",
        compoundingInterval: "monthly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1,
        contributionPhases: [],
      };

      const result = simulateRetirement(inputs);
      const firstYear = result.rows[0];

      // With 12% annual return, monthly compounding gives ~12.68% effective rate
      // 100000 * (1 + 0.01)^12 ≈ 112682.50
      expect(firstYear.growth).toBeGreaterThan(12000);
      expect(firstYear.growth).toBeLessThan(13000);
    });

    it("should handle yearly compounding correctly", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 100000,
        monthlyRetirementSpend: 3000,
        expectedYearlyReturn: 10,
        inflationRate: 0,
        inflationMode: "nominal",
        compoundingInterval: "yearly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1,
        contributionPhases: [],
      };

      const result = simulateRetirement(inputs);
      const firstYear = result.rows[0];

      // 100000 * 0.10 = 10000
      expect(firstYear.growth).toBeCloseTo(10000, 0);
    });

    it("should calculate contributions from multiple phases", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 0,
        monthlyRetirementSpend: 3000,
        expectedYearlyReturn: 7,
        inflationRate: 3,
        inflationMode: "real",
        compoundingInterval: "yearly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1,
        contributionPhases: [
          { startAge: 30, endAge: 40, monthlyContribution: 1000 },
          { startAge: 35, endAge: 50, monthlyContribution: 500 },
        ],
      };

      const result = simulateRetirement(inputs);

      // Age 30-34: 1000/month = 12000/year
      expect(result.rows[0].contribution).toBe(12000);

      // Age 35-39: 1000 + 500 = 1500/month = 18000/year
      const age35Row = result.rows.find(r => r.age === 35);
      expect(age35Row?.contribution).toBe(18000);

      // Age 40-49: 500/month = 6000/year
      const age40Row = result.rows.find(r => r.age === 40);
      expect(age40Row?.contribution).toBe(6000);

      // Age 50+: 0/month = 0/year
      const age50Row = result.rows.find(r => r.age === 50);
      expect(age50Row?.contribution).toBe(0);
    });

    it("should handle negative contributions (withdrawals)", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 100000,
        monthlyRetirementSpend: 0,
        expectedYearlyReturn: 5,
        inflationRate: 0,
        inflationMode: "nominal",
        compoundingInterval: "yearly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1,
        contributionPhases: [
          { startAge: 30, endAge: 35, monthlyContribution: -500 },
        ],
      };

      const result = simulateRetirement(inputs);

      // Negative contribution = withdrawal
      expect(result.rows[0].contribution).toBe(-6000);

      // Portfolio should decrease by withdrawal amount (minus growth)
      expect(result.rows[0].portfolioEnd).toBeLessThan(100000);
    });

    it("should detect retirement when portfolio reaches FI target", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 0,
        monthlyRetirementSpend: 3000,
        expectedYearlyReturn: 10,
        inflationRate: 0,
        inflationMode: "nominal",
        compoundingInterval: "yearly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1,
        contributionPhases: [
          { startAge: 30, monthlyContribution: 5000 },
        ],
      };

      const result = simulateRetirement(inputs);

      // Should retire when portfolio >= (36000 / 0.04) = $900,000
      expect(result.retirementAge).not.toBeNull();
      expect(result.retirementAge).toBeGreaterThan(30);
      expect(result.yearsToRetirement).not.toBeNull();

      // Check that retirement flag is set correctly
      const retirementRow = result.rows.find(r => r.age === result.retirementAge);
      expect(retirementRow?.retired).toBe(true);
    });

    it("should apply retirement buffer multiplier", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 0,
        monthlyRetirementSpend: 3000,
        expectedYearlyReturn: 7,
        inflationRate: 3,
        inflationMode: "real",
        compoundingInterval: "yearly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1.5,
        contributionPhases: [],
      };

      const result = simulateRetirement(inputs);

      // FI target = (36000 / 0.04) * 1.5 = $1,350,000
      expect(result.fiTarget).toBeCloseTo(1350000, 0);
    });

    it("should calculate inflation-adjusted returns in real mode", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 100000,
        monthlyRetirementSpend: 3000,
        expectedYearlyReturn: 10,
        inflationRate: 3,
        inflationMode: "real",
        compoundingInterval: "yearly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1,
        contributionPhases: [],
      };

      const result = simulateRetirement(inputs);

      // Real return = 10% - 3% = 7%
      // 100000 * 0.07 = 7000
      expect(result.rows[0].growth).toBeCloseTo(7000, 0);
    });

    it("should use nominal returns in nominal mode", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 100000,
        monthlyRetirementSpend: 3000,
        expectedYearlyReturn: 10,
        inflationRate: 3,
        inflationMode: "nominal",
        compoundingInterval: "yearly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1,
        contributionPhases: [],
      };

      const result = simulateRetirement(inputs);

      // Nominal mode ignores inflation, uses full 10%
      // 100000 * 0.10 = 10000
      expect(result.rows[0].growth).toBeCloseTo(10000, 0);
    });

    it("should handle contributions after retirement", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 1000000,
        monthlyRetirementSpend: 3000,
        expectedYearlyReturn: 7,
        inflationRate: 3,
        inflationMode: "real",
        compoundingInterval: "yearly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1,
        contributionPhases: [
          { startAge: 30, monthlyContribution: 500 },
        ],
      };

      const result = simulateRetirement(inputs);

      // Should retire immediately (already have > FI target)
      expect(result.retirementAge).toBe(30);

      // But still make contributions
      expect(result.rows[0].contribution).toBe(6000);
    });

    it("should stop simulation at age 100", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 10000,
        monthlyRetirementSpend: 100,
        expectedYearlyReturn: 5,
        inflationRate: 0,
        inflationMode: "nominal",
        compoundingInterval: "yearly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1,
        contributionPhases: [],
      };

      const result = simulateRetirement(inputs);

      // Should simulate from 30 to 100 = 71 years
      expect(result.rows.length).toBeLessThanOrEqual(71);

      const lastRow = result.rows[result.rows.length - 1];
      expect(lastRow.age).toBeLessThanOrEqual(100);
    });

    it("should handle portfolio depletion", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 3000000,
        monthlyRetirementSpend: 10000,
        expectedYearlyReturn: 2,
        inflationRate: 0,
        inflationMode: "nominal",
        compoundingInterval: "yearly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1,
        contributionPhases: [],
      };

      const result = simulateRetirement(inputs);

      // Should retire immediately (3000000 >= (120000/0.04) = 3000000)
      expect(result.retirementAge).toBe(30);

      // With 4% withdrawal rate and only 2% growth, portfolio should slowly deplete
      const lastRow = result.rows[result.rows.length - 1];
      expect(lastRow.portfolioEnd).toBeLessThan(3000000);
    });

    it("should handle phases with no end age", () => {
      const inputs: RetirementInputs = {
        currentAge: 30,
        initialInvestment: 0,
        monthlyRetirementSpend: 3000,
        expectedYearlyReturn: 7,
        inflationRate: 3,
        inflationMode: "real",
        compoundingInterval: "yearly",
        safeWithdrawalRate: 4,
        retirementBufferMultiplier: 1,
        contributionPhases: [
          { startAge: 30, monthlyContribution: 1000 },
        ],
      };

      const result = simulateRetirement(inputs);

      // Should continue contributing all years
      const lastRow = result.rows[result.rows.length - 1];
      expect(lastRow.contribution).toBe(12000);
    });
  });

  describe("formatCurrency", () => {
    it("should format positive numbers correctly", () => {
      expect(formatCurrency(1234567)).toBe("$1,234,567");
      expect(formatCurrency(100)).toBe("$100");
      expect(formatCurrency(0)).toBe("$0");
    });

    it("should format negative numbers correctly", () => {
      expect(formatCurrency(-1234)).toBe("-$1,234");
      expect(formatCurrency(-0.5)).toBe("-$1");
    });

    it("should round to nearest dollar", () => {
      expect(formatCurrency(123.45)).toBe("$123");
      expect(formatCurrency(123.89)).toBe("$124");
    });
  });

  describe("formatPercent", () => {
    it("should format percentages with default 1 decimal", () => {
      expect(formatPercent(5.5)).toBe("5.5%");
      expect(formatPercent(10)).toBe("10.0%");
      expect(formatPercent(7.456)).toBe("7.5%");
    });

    it("should format percentages with custom decimals", () => {
      expect(formatPercent(5.5, 0)).toBe("6%");
      expect(formatPercent(5.5, 2)).toBe("5.50%");
    });
  });
});
