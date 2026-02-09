"use client";

import { useState, useMemo } from "react";
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
  const [showContributions, setShowContributions] = useState(true);
  const [showGrowth, setShowGrowth] = useState(true);

  // Transform data for stacked area chart
  const chartData = rows.map((row) => ({
    age: row.age,
    contributions: row.totalContributions,
    growth: Math.max(0, row.portfolioEnd - row.totalContributions),
    portfolio: row.portfolioEnd,
    retired: row.retired,
  }));

  // Calculate max value for Y-axis based on visible lines
  const maxValue = useMemo(() => {
    if (!showContributions && !showGrowth) return 0;
    
    return Math.max(...chartData.map(d => {
      if (showContributions && showGrowth) return d.portfolio;
      if (showContributions) return d.contributions;
      if (showGrowth) return d.growth;
      return 0;
    }));
  }, [chartData, showContributions, showGrowth]);

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-gray-100">Portfolio Growth Over Time</h2>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showContributions}
              onChange={(e) => setShowContributions(e.target.checked)}
              className="mr-2"
            />
            <span className="text-orange-600 dark:text-orange-400">Contributions</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showGrowth}
              onChange={(e) => setShowGrowth(e.target.checked)}
              className="mr-2"
            />
            <span className="text-green-600 dark:text-green-400">Growth</span>
          </label>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
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
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" opacity={0.5} />
          <XAxis
            dataKey="age"
            label={{ value: "Age", position: "insideBottom", offset: -10 }}
            className="dark:fill-gray-300"
            tick={{ fill: "currentColor" }}
          />
          <YAxis
            domain={[0, maxValue]}
            tickFormatter={(value) =>
              `$${(value / 1000).toFixed(0)}k`
            }
            label={{
              value: "Portfolio Value",
              angle: -90,
              position: "center",
              offset: 0,
              style: { textAnchor: 'middle', fill: 'currentColor' }
            }}
            className="dark:fill-gray-300"
            tick={{ fill: "currentColor" }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          {showContributions && (
            <Area
              type="monotone"
              dataKey="contributions"
              stackId="1"
              stroke="#F97316"
              fill="url(#colorContributions)"
              name="Contributions"
            />
          )}
          {showGrowth && (
            <Area
              type="monotone"
              dataKey="growth"
              stackId="1"
              stroke="#10B981"
              fill="url(#colorGrowth)"
              name="Growth"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
