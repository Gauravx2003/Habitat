import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BLOCK_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#ec4899",
];

interface BlockData {
  block: string;
  count: number;
}

interface Props {
  data: BlockData[];
}

const EscalatedBlockChart = ({ data }: Props) => {
  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        Complaints by Block
      </h3>
      {sorted.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sorted} layout="vertical" barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#64748b" }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="block"
              tick={{ fontSize: 12, fill: "#334155", fontWeight: 500 }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
              }}
              formatter={(value: any) => [`${value}`, "Complaints"]}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {sorted.map((_, i) => (
                <Cell key={i} fill={BLOCK_COLORS[i % BLOCK_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
          No block data available
        </div>
      )}
    </div>
  );
};

export default EscalatedBlockChart;
