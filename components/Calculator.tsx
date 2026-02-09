"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RetirementInputs } from "@/lib/types";
import { simulateRetirement } from "@/lib/finance";
import { DEFAULT_INPUTS, PRESETS } from "@/lib/presets";
import { encodeInputsToUrl, decodeInputsFromUrl } from "@/lib/urlState";
import InputsForm from "@/components/InputsForm";
import ResultsSummary from "@/components/ResultsSummary";
import YearlyTable from "@/components/YearlyTable";
import PortfolioChart from "@/components/PortfolioChart";
import SegmentedControl from "@/components/SegmentedControl";

export default function Calculator() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize inputs from URL or default
  const [inputs, setInputs] = useState<RetirementInputs>(() => {
    if (searchParams) {
      return decodeInputsFromUrl(searchParams, DEFAULT_INPUTS);
    }
    return DEFAULT_INPUTS;
  });

  const [darkMode, setDarkMode] = useState(false);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [phasesManuallyModified, setPhasesManuallyModified] = useState(false);

  // Calculate results whenever inputs change
  const result = useMemo(() => simulateRetirement(inputs), [inputs]);

  // Update URL when inputs change
  useEffect(() => {
    const queryString = encodeInputsToUrl(inputs);
    router.replace(`/?${queryString}`, { scroll: false });
  }, [inputs, router]);

  // Check if inputs match any preset (excluding preserved fields like age, investment, spending, and phases)
  useEffect(() => {
    let matchedPreset: string | null = null;

    for (const [key, preset] of Object.entries(PRESETS)) {
      const presetInputs = preset.inputs;

      // Compare only non-preserved fields (not age, investment, spending, life expectancy, or phases)
      if (
        presetInputs.expectedYearlyReturn === inputs.expectedYearlyReturn &&
        presetInputs.inflationRate === inputs.inflationRate &&
        presetInputs.inflationMode === inputs.inflationMode &&
        presetInputs.compoundingInterval === inputs.compoundingInterval &&
        presetInputs.safeWithdrawalRate === inputs.safeWithdrawalRate &&
        presetInputs.retirementBufferMultiplier === inputs.retirementBufferMultiplier
      ) {
        matchedPreset = key;
        break;
      }
    }
    setActivePreset(matchedPreset);
  }, [inputs]);

  // Handle current age change - update phase ages with constraints
  const handleCurrentAgeChange = (newAge: number) => {
    const ageDifference = newAge - inputs.currentAge;

    if (ageDifference !== 0 && inputs.contributionPhases.length > 0) {
      const updatedPhases = inputs.contributionPhases.map(phase => {
        let newStartAge = phase.startAge;
        let newEndAge = phase.endAge;

        if (ageDifference > 0) {
          // Age increased: shift all phases up by the difference
          newStartAge = phase.startAge + ageDifference;
          newEndAge = phase.endAge !== undefined ? phase.endAge + ageDifference : undefined;
        } else {
          // Age decreased: only shift phases that would be in the past
          if (phase.startAge < newAge) {
            // Phase start would be before current age, shift it up to current age
            const shiftAmount = newAge - phase.startAge;
            newStartAge = newAge;
            // Also shift end age by the same amount to preserve duration
            newEndAge = phase.endAge !== undefined ? phase.endAge + shiftAmount : undefined;
          }
          // Otherwise keep the phase ages unchanged (don't shift down)
        }

        return {
          ...phase,
          startAge: newStartAge,
          endAge: newEndAge,
        };
      });
      setInputs({ ...inputs, currentAge: newAge, contributionPhases: updatedPhases });
    } else {
      setInputs({ ...inputs, currentAge: newAge });
    }
  };

  // Handle preset selection with warning
  const loadPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    // Check if inputs have been modified from any preset
    const isModified = activePreset === null;

    if (isModified) {
      const confirmed = window.confirm(
        "Loading this preset will update calculation settings (except age, initial investment, retirement spending, and cash flow phases). Continue?"
      );
      if (!confirmed) return;
    }

    // Preserve current age, initial investment, retirement spending, life expectancy, and cash flow phases
    const newInputs = {
      ...preset.inputs,
      currentAge: inputs.currentAge,
      lifeExpectancy: inputs.lifeExpectancy,
      initialInvestment: inputs.initialInvestment,
      monthlyRetirementSpend: inputs.monthlyRetirementSpend,
      contributionPhases: inputs.contributionPhases, // Keep user's current phases
    };

    setInputs(newInputs);
    setActivePreset(presetKey);
  };

  // Share functionality
  const shareScenario = () => {
    const url = `${window.location.origin}/?${encodeInputsToUrl(inputs)}`;
    navigator.clipboard.writeText(url);
    alert("Scenario URL copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                🔥 FIRE Calculator
              </h1>
              <p className="mt-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Plan your path to Financial Independence & Early Retirement
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-3 md:px-4 py-2 text-xs md:text-sm rounded-md border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                aria-label="Toggle dark mode"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
              <button
                onClick={shareScenario}
                className="px-3 md:px-4 py-2 text-xs md:text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Share Scenario
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column: Inputs with Quick Presets - Sticky on Desktop */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] overflow-y-auto">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Inputs</h2>

              {/* Quick Presets */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Quick Presets</h3>
                <SegmentedControl
                  options={['conservative', 'balanced', 'aggressive'].map((key) => ({
                    key,
                    label: PRESETS[key].name,
                  }))}
                  value={activePreset}
                  onChange={loadPreset}
                />
              </div>

              <InputsForm
                inputs={inputs}
                onChange={setInputs}
                onCurrentAgeChange={handleCurrentAgeChange}
              />
            </div>
          </div>

          {/* Right Column: Results - Normal Scrolling */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <ResultsSummary
              result={result}
              currentAge={inputs.currentAge}
              lifeExpectancy={inputs.lifeExpectancy ?? 90}
            />
            <PortfolioChart
              rows={result.rows}
              retirementAge={result.retirementAge}
            />
            <YearlyTable rows={result.rows} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-xs md:text-sm text-gray-600 dark:text-gray-400">
          <p>
            This calculator is for educational purposes only and does not constitute financial advice.
          </p>
          <p className="mt-2">
            Calculations assume constant returns and do not account for taxes, asset allocation, or market volatility.
          </p>
        </footer>
      </main>
    </div>
  );
}
