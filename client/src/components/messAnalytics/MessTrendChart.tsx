import { useState, useMemo } from "react";
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

interface TrendData {
  reported: { date: string; count: number }[];
  resolved: { date: string; count: number }[];
}

interface Props {
  dailyTrend: TrendData;
}

type Period = "daily" | "weekly" | "monthly";

const MessTrendChart = ({ dailyTrend }: Props) => {
  const [period, setPeriod] = useState<Period>("daily");

  const chartData = useMemo(() => {
    // Build a map of all dates with both reported + resolved
    const dateMap: Record<
      string,
      { date: string; Reported: number; Resolved: number }
    > = {};

    for (const d of dailyTrend.reported) {
      if (!dateMap[d.date])
        dateMap[d.date] = { date: d.date, Reported: 0, Resolved: 0 };
      dateMap[d.date].Reported = d.count;
    }
    for (const d of dailyTrend.resolved) {
      if (!dateMap[d.date])
        dateMap[d.date] = { date: d.date, Reported: 0, Resolved: 0 };
      dateMap[d.date].Resolved = d.count;
    }

    const daily = Object.values(dateMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    if (period === "daily") return daily;

    // Aggregate into weekly or monthly
    const bucketMap: Record<string, { Reported: number; Resolved: number }> =
      {};

    for (const d of daily) {
      const dt = new Date(d.date);
      let key: string;

      if (period === "weekly") {
        // Start of week (Monday)
        const day = dt.getDay();
        const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(dt);
        monday.setDate(diff);
        key = `Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      } else {
        key = dt.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      }

      if (!bucketMap[key]) bucketMap[key] = { Reported: 0, Resolved: 0 };
      bucketMap[key].Reported += d.Reported;
      bucketMap[key].Resolved += d.Resolved;
    }

    return Object.entries(bucketMap).map(([date, vals]) => ({
      date,
      ...vals,
    }));
  }, [dailyTrend, period]);

  const periods: { value: Period; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Reported vs Resolved
        </h3>
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="reportedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(val) => {
                if (period !== "daily") return val;
                const d = new Date(val);
                return d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
              }}
              labelFormatter={(val) => {
                if (period !== "daily") return val;
                return new Date(val).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Area
              type="monotone"
              dataKey="Reported"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#reportedGrad)"
            />
            <Area
              type="monotone"
              dataKey="Resolved"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#resolvedGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
          No trend data available
        </div>
      )}
    </div>
  );
};

export default MessTrendChart;
