"use client";

import { RetirementInputs, ContributionPhase } from "@/lib/types";

interface InputsFormProps {
  inputs: RetirementInputs;
  onChange: (inputs: RetirementInputs) => void;
  showFormulas: boolean;
}

export default function InputsForm({
  inputs,
  onChange,
  showFormulas,
}: InputsFormProps) {
  const updateInput = <K extends keyof RetirementInputs>(
    key: K,
    value: RetirementInputs[K]
  ) => {
    onChange({ ...inputs, [key]: value });
  };

  const updatePhase = (index: number, phase: ContributionPhase) => {
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

  return (
    <div className="space-y-8">
      {/* User Profile */}
      <section>
        <h2 className="text-xl font-semibold mb-4">User Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Current Age
            </label>
            <input
              type="number"
              value={inputs.currentAge}
              onChange={(e) =>
                updateInput("currentAge", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
              min="18"
              max="80"
            />
          </div>
        </div>
      </section>

      {/* Financial Inputs */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Financial Inputs</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Initial Investment ($)
            </label>
            <input
              type="number"
              value={inputs.initialInvestment}
              onChange={(e) =>
                updateInput("initialInvestment", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Monthly Retirement Spend ($)
            </label>
            <input
              type="number"
              value={inputs.monthlyRetirementSpend}
              onChange={(e) =>
                updateInput("monthlyRetirementSpend", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
              min="0"
              step="100"
            />
            {showFormulas && (
              <p className="text-xs text-gray-500 mt-1">
                Annual spend = ${(inputs.monthlyRetirementSpend * 12).toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Expected Yearly Return (%)
            </label>
            <input
              type="number"
              value={inputs.expectedYearlyReturn}
              onChange={(e) =>
                updateInput("expectedYearlyReturn", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
              min="0"
              max="20"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Inflation Rate (%)
            </label>
            <input
              type="number"
              value={inputs.inflationRate}
              onChange={(e) =>
                updateInput("inflationRate", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
              min="0"
              max="10"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Inflation Mode
            </label>
            <select
              value={inputs.inflationMode}
              onChange={(e) =>
                updateInput("inflationMode", e.target.value as "nominal" | "real")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="real">Real (Adjusted)</option>
              <option value="nominal">Nominal</option>
            </select>
            {showFormulas && inputs.inflationMode === "real" && (
              <p className="text-xs text-gray-500 mt-1">
                Effective return = {inputs.expectedYearlyReturn}% - {inputs.inflationRate}% ={" "}
                {(inputs.expectedYearlyReturn - inputs.inflationRate).toFixed(1)}%
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Compounding Interval
            </label>
            <select
              value={inputs.compoundingInterval}
              onChange={(e) =>
                updateInput(
                  "compoundingInterval",
                  e.target.value as "monthly" | "yearly"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Safe Withdrawal Rate (%)
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
            <label className="block text-sm font-medium mb-1">
              Retirement Buffer Multiplier
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

      {/* Contribution Phases */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Contribution Phases</h2>
        <div className="space-y-4">
          {inputs.contributionPhases.map((phase, index) => (
            <div
              key={index}
              className="p-4 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Phase {index + 1}</h3>
                {inputs.contributionPhases.length > 1 && (
                  <button
                    onClick={() => removePhase(index)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Start Age
                  </label>
                  <input
                    type="number"
                    value={phase.startAge}
                    onChange={(e) =>
                      updatePhase(index, {
                        ...phase,
                        startAge: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
                    min={inputs.currentAge}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    End Age
                  </label>
                  <input
                    type="number"
                    value={phase.endAge ?? ""}
                    onChange={(e) =>
                      updatePhase(index, {
                        ...phase,
                        endAge: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Retirement"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
                    min={phase.startAge}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Monthly ($)
                  </label>
                  <input
                    type="number"
                    value={phase.monthlyContribution}
                    onChange={(e) =>
                      updatePhase(index, {
                        ...phase,
                        monthlyContribution: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
                    min="0"
                    step="100"
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
