interface CategoryData {
  category: string;
  count: number;
}

interface Props {
  data: CategoryData[];
}

const CATEGORY_COLORS: Record<string, string> = {
  FOOD: "bg-indigo-500",
  SERVICE: "bg-amber-500",
  HYGIENE: "bg-emerald-500",
  INFRASTRUCTURE: "bg-rose-500",
  OTHER: "bg-purple-500",
};

const MessCategoryTable = ({ data }: Props) => {
  const total = data.reduce((s, d) => s + d.count, 0);
  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">
          Issues by Category
        </h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-slate-100">
            <th className="text-left px-5 py-3 font-medium">Category</th>
            <th className="text-center px-5 py-3 font-medium">Count</th>
            <th className="text-right px-5 py-3 font-medium">Share</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            const barColor = CATEGORY_COLORS[item.category] || "bg-slate-400";

            return (
              <tr
                key={item.category}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                    <span className="text-sm font-medium text-slate-800">
                      {item.category}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-center text-slate-600">
                  {item.count}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MessCategoryTable;
