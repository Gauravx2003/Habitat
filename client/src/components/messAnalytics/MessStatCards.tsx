import {
  CheckCircle2,
  Clock,
  FileChartColumnIncreasing,
  TrendingUp,
} from "lucide-react";

interface StatusCount {
  status: string;
  count: number;
}

interface Props {
  statusCounts: StatusCount[];
}

const MessStatCards = ({ statusCounts }: Props) => {
  const getCount = (s: string) =>
    statusCounts.find((sc) => sc.status === s)?.count || 0;

  const total = statusCounts.reduce((sum, s) => sum + s.count, 0);
  const resolved = getCount("RESOLVED");
  const open = getCount("OPEN");
  const inReview = getCount("IN_REVIEW");
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const cards = [
    {
      label: "Total Issues",
      value: total,
      // icon: <FileText className="w-5 h-5 text-indigo-600" />,
      icon: <FileChartColumnIncreasing className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50",
    },
    {
      label: "Open",
      value: open + inReview,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50",
    },
    {
      label: "Resolved",
      value: resolved,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      label: "Resolution Rate",
      value: `${resolutionRate}%`,
      icon: <TrendingUp className="w-5 h-5 text-rose-600" />,
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-slate-200 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}
            >
              {card.icon}
            </div>
            <span className="text-sm text-slate-500">{card.label}</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default MessStatCards;
