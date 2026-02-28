import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileChartColumnIncreasing,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface StatusCount {
  status: string;
  count: number;
}

interface Props {
  totalEscalations: number;
  escalatedStatusCounts: StatusCount[];
  overallStatusCounts: StatusCount[];
}

const EscalatedStatCards = ({
  totalEscalations,
  escalatedStatusCounts,
  overallStatusCounts,
}: Props) => {
  const getEscCount = (s: string) =>
    escalatedStatusCounts.find((sc) => sc.status === s)?.count || 0;

  const totalComplaints = overallStatusCounts.reduce(
    (sum, s) => sum + s.count,
    0,
  );
  const stillEscalated = getEscCount("ESCALATED");
  const resolvedAfterEscalation =
    getEscCount("RESOLVED") + getEscCount("CLOSED");
  const reassigned = getEscCount("ASSIGNED") + getEscCount("IN_PROGRESS");
  const escalationRate =
    totalComplaints > 0
      ? Math.round((totalEscalations / totalComplaints) * 100)
      : 0;
  const resolutionRate =
    totalEscalations > 0
      ? Math.round((resolvedAfterEscalation / totalEscalations) * 100)
      : 0;

  const cards = [
    {
      label: "Total Escalations",
      value: totalEscalations,
      icon: <FileChartColumnIncreasing className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
    {
      label: "Still Pending",
      value: stillEscalated,
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
      bg: "bg-orange-50",
      border: "border-orange-100",
    },
    {
      label: "Resolved / Closed",
      value: resolvedAfterEscalation,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Reassigned",
      value: reassigned,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Resolution Rate",
      value: `${resolutionRate}%`,
      icon: <TrendingUp className="w-5 h-5 text-sky-600" />,
      bg: "bg-sky-50",
      border: "border-sky-100",
    },
    {
      label: "Escalation Rate",
      value: `${escalationRate}%`,
      icon: <XCircle className="w-5 h-5 text-rose-600" />,
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-xl border ${card.border} p-4 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}
            >
              {card.icon}
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{card.value}</p>
          <span className="text-xs text-slate-500 mt-1 block">
            {card.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default EscalatedStatCards;
