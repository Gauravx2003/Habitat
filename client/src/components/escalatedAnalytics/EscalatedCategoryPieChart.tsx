import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

interface CategoryData {
  category: string;
  count: number;
}

interface BlockCategoryData {
  block: string;
  category: string;
  count: number;
}

interface Props {
  data: CategoryData[];
  blockCategoryData: BlockCategoryData[];
}

const EscalatedCategoryPieChart = ({ data, blockCategoryData }: Props) => {
  const [selectedBlock, setSelectedBlock] = useState<string>("ALL");

  // Extract unique block names from the cross-tab data
  const blocks = useMemo(() => {
    const unique = [...new Set(blockCategoryData.map((d) => d.block))].sort();
    return unique;
  }, [blockCategoryData]);

  // Compute pie data based on selected block
  const filteredData = useMemo(() => {
    if (selectedBlock === "ALL") return data;

    // Aggregate from blockCategoryData for the selected block
    return blockCategoryData
      .filter((d) => d.block === selectedBlock)
      .map((d) => ({ category: d.category, count: d.count }));
  }, [selectedBlock, data, blockCategoryData]);

  const total = filteredData.reduce((s, d) => s + d.count, 0);

  const chartData = filteredData.map((d) => ({
    name: d.category,
    value: d.count,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Category Distribution
        </h3>
        <select
          value={selectedBlock}
          onChange={(e) => setSelectedBlock(e.target.value)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
        >
          <option value="ALL">All Blocks</option>
          {blocks.map((block) => (
            <option key={block} value={block}>
              {block}
            </option>
          ))}
        </select>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={105}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${((percent as number) * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
              }}
              formatter={(value: any) => [
                `${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                "Complaints",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
          No category data available
          {selectedBlock !== "ALL" && ` for ${selectedBlock}`}
        </div>
      )}
    </div>
  );
};

export default EscalatedCategoryPieChart;
