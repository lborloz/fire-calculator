"use client";

import { YearRow } from "@/lib/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/finance";

interface PortfolioChartProps {
  rows: YearRow[];
  retirementAge: number | null;
}

export default function PortfolioChart({
  rows,
  retirementAge,
}: PortfolioChartProps) {
  // Transform data for stacked area chart
  const chartData = rows.map((row) => ({
    age: row.age,
    contributions: row.totalContributions,
    growth: Math.max(0, row.portfolioEnd - row.totalContributions),
    portfolio: row.portfolioEnd,
    retired: row.retired,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
          <p className="font-semibold mb-2">
            Age {data.age} {data.retired && "🎉"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Contributions: {formatCurrency(data.contributions)}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Growth: {formatCurrency(data.growth)}
          </p>
          <p className="text-sm font-semibold">
            Portfolio: {formatCurrency(data.portfolio)}
          </p>
          <p className="text-xs mt-1 text-gray-500">
            {data.retired ? "Retired" : "Working"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Portfolio Growth Over Time</h2>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="age"
            label={{ value: "Age", position: "insideBottom", offset: -5 }}
            stroke="#6B7280"
          />
          <YAxis
            tickFormatter={(value) =>
              `$${(value / 1000).toFixed(0)}k`
            }
            label={{ value: "Portfolio Value", angle: -90, position: "insideLeft" }}
            stroke="#6B7280"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="contributions"
            stackId="1"
            stroke="#F97316"
            fill="url(#colorContributions)"
            name="Contributions"
          />
          <Area
            type="monotone"
            dataKey="growth"
            stackId="1"
            stroke="#10B981"
            fill="url(#colorGrowth)"
            name="Growth"
          />
        </AreaChart>
      </ResponsiveContainer>

      {retirementAge && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          🎉 Retirement milestone reached at age {retirementAge}
        </div>
      )}
    </div>
  );
}
