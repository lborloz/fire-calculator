"use client";

import { YearRow } from "@/lib/types";
import { formatCurrency } from "@/lib/finance";

interface YearlyTableProps {
  rows: YearRow[];
}

export default function YearlyTable({ rows }: YearlyTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <h2 className="text-xl font-bold p-4 border-b dark:border-gray-700 dark:text-gray-100">
        Year-by-Year Breakdown
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Age</th>
              <th className="px-4 py-3 text-right font-semibold">
                Contribution
              </th>
              <th className="px-4 py-3 text-right font-semibold">
                Total Contributed
              </th>
              <th className="px-4 py-3 text-right font-semibold">Growth</th>
              <th className="px-4 py-3 text-right font-semibold">
                Withdrawl
              </th>
              <th className="px-4 py-3 text-right font-semibold">
                Portfolio End
              </th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {rows.map((row, index) => (
              <tr
                key={index}
                className={
                  row.retired
                    ? "bg-green-50 dark:bg-green-950/30"
                    : "bg-white dark:bg-gray-800"
                }
              >
                <td className="px-4 py-2 font-medium">{row.age}</td>
                <td className={`px-4 py-2 text-right ${
                  row.contribution < 0
                    ? "text-red-600 dark:text-red-400"
                    : ""
                }`}>
                  {formatCurrency(row.contribution)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(row.totalContributions)}
                </td>
                <td className="px-4 py-2 text-right text-green-600 dark:text-green-400">
                  {formatCurrency(row.growth)}
                </td>
                <td className="px-4 py-2 text-right text-red-600 dark:text-red-400">
                  {row.withdrawal > 0 ? formatCurrency(row.withdrawal) : "-"}
                </td>
                <td className="px-4 py-2 text-right font-semibold">
                  {formatCurrency(row.portfolioEnd)}
                </td>
                <td className="px-4 py-2 text-center">
                  {row.retired ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 dark:text-green-200 bg-green-200 dark:bg-green-800 rounded">
                      Retired
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-800 dark:text-blue-200 bg-blue-200 dark:bg-blue-800 rounded">
                      Working
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
