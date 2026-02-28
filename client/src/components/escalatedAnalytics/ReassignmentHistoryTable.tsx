import { History, ArrowRight, FileText } from "lucide-react";

interface ReassignmentRecord {
  id: string;
  complaintId: string;
  changedAt: string;
  complaintTitle: string | null;
  categoryName: string;
  residentName: string;
  changedByName: string | null;
  newStaffName: string | null;
}

interface Props {
  data: ReassignmentRecord[];
  isLoading: boolean;
}

const ReassignmentHistoryTable = ({ data, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-indigo-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">
          No reassignment history yet
        </p>
        <p className="text-sm text-slate-400 mt-1">
          When you reassign escalated complaints, the history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-500" />
          Reassignment History
        </h3>
        <span className="text-xs text-slate-400">
          {data.length} reassignment{data.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="text-left px-5 py-3 font-medium">Complaint</th>
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-left px-5 py-3 font-medium">Resident</th>
              <th className="text-left px-5 py-3 font-medium">Reassigned To</th>
            </tr>
          </thead>
          <tbody>
            {data.map((record) => (
              <tr
                key={record.id}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="text-sm text-slate-700">
                    {new Date(record.changedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(record.changedAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">
                    {record.complaintTitle || "Untitled"}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                    {record.categoryName}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-slate-700">
                    {record.residentName}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-600">
                      {record.newStaffName || "—"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {data.map((record) => (
          <div key={record.id} className="p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-800">
                  {record.complaintTitle || "Untitled"}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(record.changedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {record.categoryName}
              </span>
              <span className="text-slate-500">by {record.residentName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowRight className="w-3 h-3 text-indigo-400" />
              <span className="text-indigo-600 font-medium">
                Reassigned to {record.newStaffName || "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReassignmentHistoryTable;
