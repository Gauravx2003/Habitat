import { Grid3X3 } from "lucide-react";

interface BlockCategoryData {
  block: string;
  category: string;
  count: number;
}

interface Props {
  data: BlockCategoryData[];
}

const HEAT_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-yellow-100 text-yellow-700",
  "bg-orange-100 text-orange-700",
  "bg-rose-100 text-rose-700",
];

const EscalatedBlockCategoryTable = ({ data }: Props) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-violet-500" />
          Top Category per Block
        </h3>
        <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">
          No data available
        </div>
      </div>
    );
  }

  // Group: for each block, pick the top category (highest count)
  const blockMap: Record<string, { category: string; count: number }> = {};

  for (const item of data) {
    if (!blockMap[item.block] || item.count > blockMap[item.block].count) {
      blockMap[item.block] = { category: item.category, count: item.count };
    }
  }

  const rows = Object.entries(blockMap)
    .map(([block, val]) => ({ block, ...val }))
    .sort((a, b) => b.count - a.count);

  const maxCount = rows[0]?.count || 1;

  const getHeatColor = (count: number) => {
    const ratio = count / maxCount;
    if (ratio >= 0.75) return HEAT_COLORS[3];
    if (ratio >= 0.5) return HEAT_COLORS[2];
    if (ratio >= 0.25) return HEAT_COLORS[1];
    return HEAT_COLORS[0];
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-violet-500" />
          Top Category per Block
        </h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-slate-100">
            <th className="text-left px-5 py-3 font-medium">Block</th>
            <th className="text-center px-5 py-3 font-medium">Top Category</th>
            <th className="text-right px-5 py-3 font-medium">Complaints</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.block}
              className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-5 py-3">
                <span className="text-sm font-medium text-slate-800">
                  {row.block}
                </span>
              </td>
              <td className="px-5 py-3 text-center">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getHeatColor(row.count)}`}
                >
                  {row.category}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <span className="text-sm font-semibold text-slate-700">
                  {row.count}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EscalatedBlockCategoryTable;
