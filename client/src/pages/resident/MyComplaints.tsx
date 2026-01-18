import { useEffect, useState } from "react";
import api from "../../services/api";
import AttachmentsUpload from "../../components/AttachmentsUpload";
import { AlertCircle, CheckCircle2, Clock, FileText, Plus } from "lucide-react";
import RaiseComplaintModal from "../../components/RaiseComplaintModal";

interface Complaint {
  id: string;
  title: string;
  categoryName: string;
  description: string;
  type: string;
  status: string;
  createdAt: string;
  staffName?: string;
}

const MyComplaints = () => {
  const [complaints, setMyComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = () => {
    setIsLoading(true);
    api
      .get("/complaints/my")
      .then((res) => {
        setMyComplaints(res.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  //console.log(complaints);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "RESOLVED":
        return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "RESOLVED":
        return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case "REJECTED":
        return <AlertCircle className="w-3 h-3 mr-1" />;
      default:
        return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  // <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  //       <div>
  //         <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
  //           My Lost Items
  //         </h1>
  //         <p className="text-sm text-slate-500 mt-1">
  //           Track status of items you have reported lost
  //         </p>
  //       </div>
  //     </div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            My Complaints
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track status of complaints you have reported
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Complaint
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-indigo-600"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No complaints yet</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    complaint.status
                  )}`}
                >
                  {getStatusIcon(complaint.status)}
                  {complaint.status}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-semibold text-slate-900 mb-2">
                {complaint.title}
              </h3>

              <div className="flex gap-2 mb-3 text-xs">
                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">
                  {complaint.categoryName}
                </span>
                {complaint.staffName ? (
                  <span className="text-blue-700 px-2 py-1 rounded">
                    Assigned to: {complaint.staffName}
                  </span>
                ) : (
                  <span className="text-blue-700 px-2 py-1 rounded">
                    Not assigned
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {complaint.description}
              </p>

              <AttachmentsUpload
                uploadUrl={`/complaints/${complaint.id}/attachments`}
                onSuccess={() => {
                  fetchComplaints();
                }}
              />
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <RaiseComplaintModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchComplaints}
        />
      )}
    </div>
  );
};

export default MyComplaints;
