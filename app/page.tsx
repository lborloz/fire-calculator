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

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize inputs from URL or default
  const [inputs, setInputs] = useState<RetirementInputs>(() => {
    if (searchParams) {
      return decodeInputsFromUrl(searchParams, DEFAULT_INPUTS);
    }
    return DEFAULT_INPUTS;
  });

  const [showFormulas, setShowFormulas] = useState(false);

  // Calculate results whenever inputs change
  const result = useMemo(() => simulateRetirement(inputs), [inputs]);

  // Update URL when inputs change
  useEffect(() => {
    const queryString = encodeInputsToUrl(inputs);
    router.replace(`/?${queryString}`, { scroll: false });
  }, [inputs, router]);

  // Handle preset selection
  const loadPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setInputs(preset.inputs);
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                FIRE Calculator
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Plan your path to Financial Independence & Early Retirement
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFormulas(!showFormulas)}
                className={`px-4 py-2 text-sm rounded-md border ${
                  showFormulas
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                }`}
              >
                {showFormulas ? "Hide" : "Show"} Math
              </button>
              <button
                onClick={shareScenario}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Share Scenario
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Presets */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Quick Presets</h2>
          <div className="flex gap-3">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => loadPreset(key)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold mb-6">Inputs</h2>
              <InputsForm
                inputs={inputs}
                onChange={setInputs}
                showFormulas={showFormulas}
              />
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2 space-y-8">
            <ResultsSummary result={result} currentAge={inputs.currentAge} />
            <PortfolioChart
              rows={result.rows}
              retirementAge={result.retirementAge}
            />
            <YearlyTable rows={result.rows} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
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
