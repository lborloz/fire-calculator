"use client";

import { RetirementInputs, ContributionPhase, SpendInputType } from "@/lib/types";
import { useState } from "react";
import InfoTooltip from "./InfoTooltip";
import CurrencyInput from "./CurrencyInput";
import NumberInput from "./NumberInput";

interface InputsFormProps {
  inputs: RetirementInputs;
  onChange: (inputs: RetirementInputs) => void;
  onCurrentAgeChange?: (age: number) => void;
}

export default function InputsForm({
  inputs,
  onChange,
  onCurrentAgeChange,
}: InputsFormProps) {
  const [spendInputType, setSpendInputType] = useState<SpendInputType>("monthly");

  const updateInput = <K extends keyof RetirementInputs>(
    key: K,
    value: RetirementInputs[K]
  ) => {
    onChange({ ...inputs, [key]: value });
  };

  const handleCurrentAgeChange = (age: number) => {
    updateInput("currentAge", age);
    if (onCurrentAgeChange) {
      onCurrentAgeChange(age);
    }
  };

  const updatePhase = (index: number, phase: ContributionPhase) => {
    // Ensure end age is always at least start age + 1 if defined
    if (phase.endAge !== undefined && phase.endAge <= phase.startAge) {
      phase = { ...phase, endAge: phase.startAge + 1 };
    }
    const newPhases = [...inputs.contributionPhases];
    newPhases[index] = phase;
    updateInput("contributionPhases", newPhases);
  };

  const addPhase = () => {
    const lastPhase =
      inputs.contributionPhases[inputs.contributionPhases.length - 1];
    const startAge = lastPhase ? (lastPhase.endAge ?? inputs.currentAge) : inputs.currentAge;

    updateInput("contributionPhases", [
      ...inputs.contributionPhases,
      {
        startAge,
        endAge: undefined,
        monthlyContribution: 1000,
      },
    ]);
  };

  const removePhase = (index: number) => {
    const newPhases = inputs.contributionPhases.filter((_, i) => i !== index);
    updateInput("contributionPhases", newPhases);
  };

  // Get display value for retirement spend based on input type
  const getRetirementSpendDisplay = () => {
    return spendInputType === "monthly"
      ? inputs.monthlyRetirementSpend
      : inputs.monthlyRetirementSpend * 12;
  };

  const handleRetirementSpendChange = (value: number) => {
    const monthlyValue = spendInputType === "monthly" ? value : value / 12;
    updateInput("monthlyRetirementSpend", monthlyValue);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* User Profile */}
      <section>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              Current Age
              <InfoTooltip content="Your current age. The calculator will simulate from this age until age 100 or retirement." />
            </label>
            <NumberInput
              value={inputs.currentAge}
              onChange={(value) =>
                handleCurrentAgeChange(value ?? 18)
              }
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              min={18}
              max={80}
              step={1}
            />
          </div>
        </div>
      </section>

      {/* Financial Inputs */}
      <section>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              Initial Investment ($)
              <InfoTooltip content="Your current portfolio balance or starting investment amount. This is treated as the first contribution." />
            </label>
            <CurrencyInput
              value={inputs.initialInvestment}
              onChange={(value) => updateInput("initialInvestment", value)}
              className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              min={0}
              step={1000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              Retirement Spending ($)
              <InfoTooltip content="How much you plan to spend in retirement. Used to calculate your FI target number based on the Safe Withdrawal Rate." />
            </label>
            <div className="mb-2 flex gap-4">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  value="monthly"
                  checked={spendInputType === "monthly"}
                  onChange={(e) => setSpendInputType(e.target.value as SpendInputType)}
                  className="mr-2"
                />
                Monthly
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  value="yearly"
                  checked={spendInputType === "yearly"}
                  onChange={(e) => setSpendInputType(e.target.value as SpendInputType)}
                  className="mr-2"
                />
                Yearly
              </label>
            </div>
            <CurrencyInput
              value={getRetirementSpendDisplay()}
              onChange={handleRetirementSpendChange}
              className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              min={0}
              step={100}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {spendInputType === "monthly"
                ? `≈ $${(inputs.monthlyRetirementSpend * 12).toLocaleString()}/year`
                : `≈ $${(inputs.monthlyRetirementSpend).toLocaleString()}/month`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              Expected Yearly Return (%)
              <InfoTooltip content="Your expected annual investment return rate. Historical stock market average is ~10% nominal. Be conservative for planning." />
            </label>
            <NumberInput
              value={inputs.expectedYearlyReturn}
              onChange={(value) =>
                updateInput("expectedYearlyReturn", value ?? 10)
              }
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              min={0}
              max={20}
              step={0.1}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              Inflation Rate (%)
              <InfoTooltip content="Expected annual inflation rate. Historical US average is ~3%. This adjusts your returns in Real mode." />
            </label>
            <NumberInput
              value={inputs.inflationRate}
              onChange={(value) =>
                updateInput("inflationRate", value ?? 3)
              }
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              min={0}
              max={10}
              step={0.1}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              Inflation Mode
              <InfoTooltip content="Real mode (recommended): Adjusts returns for inflation and treats spending as today's dollars. Nominal mode: Uses raw returns without adjustment." />
            </label>
            <select
              value={inputs.inflationMode}
              onChange={(e) =>
                updateInput("inflationMode", e.target.value as "nominal" | "real")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="real">Real (Adjusted)</option>
              <option value="nominal">Nominal</option>
            </select>
            {inputs.inflationMode === "real" && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Effective return = {inputs.expectedYearlyReturn}% - {inputs.inflationRate}% ={" "}
                {(inputs.expectedYearlyReturn - inputs.inflationRate).toFixed(1)}%
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              Compounding Interval
              <InfoTooltip content="How often returns compound. Monthly compounding gives slightly higher returns than yearly due to compound interest." />
            </label>
            <select
              value={inputs.compoundingInterval}
              onChange={(e) =>
                updateInput(
                  "compoundingInterval",
                  e.target.value as "monthly" | "yearly"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              Safe Withdrawal Rate (%)
              <InfoTooltip content="Percentage of portfolio you can safely withdraw annually. The '4% rule' is based on historical success rates. Lower rates are more conservative." />
            </label>
            <input
              type="range"
              value={inputs.safeWithdrawalRate}
              onChange={(e) =>
                updateInput("safeWithdrawalRate", parseFloat(e.target.value))
              }
              className="w-full"
              min="3"
              max="5"
              step="0.1"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {inputs.safeWithdrawalRate.toFixed(1)}%
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              Retirement Buffer Multiplier
              <InfoTooltip content="Safety buffer for your FI target. 1.0x = no buffer, 1.25x = 25% extra cushion. Higher values delay retirement but increase security." />
            </label>
            <input
              type="range"
              value={inputs.retirementBufferMultiplier}
              onChange={(e) =>
                updateInput(
                  "retirementBufferMultiplier",
                  parseFloat(e.target.value)
                )
              }
              className="w-full"
              min="1.0"
              max="1.25"
              step="0.05"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {inputs.retirementBufferMultiplier.toFixed(2)}x
            </div>
          </div>
        </div>
      </section>

      {/* Cash Flow Phases */}
      <section>
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Cash Flow Phases
          <InfoTooltip content="Define different periods of contributions (or withdrawals) throughout your life. Phases can overlap (amounts will stack) or have gaps. Use negative values for withdrawals." />
        </h2>
        <div className="space-y-4">
          {inputs.contributionPhases.map((phase, index) => (
            <div
              key={index}
              className="p-3 md:p-4 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-sm md:text-base">Phase {index + 1}</h3>
                {inputs.contributionPhases.length > 1 && (
                  <button
                    onClick={() => removePhase(index)}
                    className="text-red-600 text-xs md:text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Start Age
                  </label>
                  <NumberInput
                    value={phase.startAge}
                    onChange={(value) =>
                      updatePhase(index, {
                        ...phase,
                        startAge: value ?? inputs.currentAge,
                      })
                    }
                    className="w-full px-2 py-1 pr-8 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    min={inputs.currentAge}
                    step={1}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    End Age
                  </label>
                  <NumberInput
                    value={phase.endAge}
                    onChange={(value) =>
                      updatePhase(index, {
                        ...phase,
                        endAge: value,
                      })
                    }
                    placeholder="Ongoing"
                    className="w-full px-2 py-1 pr-8 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    min={phase.startAge}
                    step={1}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Monthly ($)
                    <InfoTooltip content="Monthly contribution amount. Use negative values to model withdrawals (e.g., -500 for $500/month withdrawal)." />
                  </label>
                  <CurrencyInput
                    value={phase.monthlyContribution}
                    onChange={(value) =>
                      updatePhase(index, {
                        ...phase,
                        monthlyContribution: value,
                      })
                    }
                    className="w-full px-2 py-1 pr-10 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    step={100}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addPhase}
            className="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
          >
            + Add Phase
          </button>
        </div>
      </section>
    </div>
  );
}
