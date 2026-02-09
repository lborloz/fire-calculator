"use client";

import { SimulationResult } from "@/lib/types";
import { formatCurrency } from "@/lib/finance";

interface ResultsSummaryProps {
  result: SimulationResult;
  currentAge: number;
  lifeExpectancy: number;
}

export default function ResultsSummary({
  result,
  currentAge,
  lifeExpectancy,
}: ResultsSummaryProps) {
  const { retirementAge, fiTarget, yearsToRetirement } = result;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Results Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Retirement Age
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {retirementAge !== null ? retirementAge : "Never"}
          </div>
          {retirementAge !== null && (
            <div className="text-xs text-gray-500 mt-1">
              Current age: {currentAge}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            FI Target Number
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(fiTarget)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Portfolio needed to retire
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Years to Retirement
          </div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {yearsToRetirement !== null ? yearsToRetirement : "∞"}
          </div>
          {yearsToRetirement !== null && yearsToRetirement > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {yearsToRetirement === 1 ? "1 year" : `${yearsToRetirement} years`}
            </div>
          )}
        </div>
      </div>

      {retirementAge === null && (
        <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 rounded">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Based on current inputs, you may not reach your
            FI target within your life expectancy ({lifeExpectancy - currentAge}{" "}
            more years). Consider increasing contributions or adjusting your retirement
            spending.
          </p>
        </div>
      )}
    </div>
  );
}
