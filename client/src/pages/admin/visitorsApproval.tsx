import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  User,
  Home,
  Calendar,
  Phone,
} from "lucide-react";
import { SkeletonCard } from "../../components/SkeletonCard";

interface VisitorRequest {
  id: string;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  relation: string;
  visitDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CLOSED";
  createdAt: string;
  residentName: string;
  roomNumber: string;
  block: string;
}

const VisitorsApproval = () => {
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "CLOSED"
  >("PENDING");

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let endpoint = "/visitors/all";

      if (filter !== "ALL") {
        endpoint += `?status=${filter}`;
      }

      const response = await api.get(endpoint);
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/visitors/${id}/update`, { status: "APPROVED" });
      fetchRequests();
    } catch (error) {
      console.error("Failed to approve request:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/visitors/${id}/update`, { status: "REJECTED" });
      fetchRequests();
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "Approved",
          icon: <CheckCircle className="w-3 h-3" />,
          color: "bg-green-100 text-green-700",
        };
      case "REJECTED":
        return {
          label: "Rejected",
          icon: <XCircle className="w-3 h-3" />,
          color: "bg-red-100 text-red-700",
        };
      case "PENDING":
        return {
          label: "Pending",
          icon: <Clock className="w-3 h-3" />,
          color: "bg-yellow-100 text-yellow-700",
        };
      case "CLOSED":
        return {
          label: "Closed",
          icon: <CheckCircle className="w-3 h-3" />,
          color: "bg-slate-100 text-slate-700",
        };
      default:
        return {
          label: status,
          icon: <AlertCircle className="w-3 h-3" />,
          color: "bg-slate-100 text-slate-700",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Visitor Approvals
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and manage visitor requests from residents
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("PENDING")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "PENDING"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("APPROVED")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "APPROVED"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter("REJECTED")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "REJECTED"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setFilter("CLOSED")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "CLOSED"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Closed
        </button>
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "ALL"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Requests
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No requests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((request) => {
            const status = getStatusBadge(request.status);

            return (
              <div
                key={request.id}
                className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-base">
                        {request.visitorName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{request.visitorPhone}</span>
                        <span className="mx-1">•</span>
                        <span>{request.relation}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${status.color}`}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-4 space-y-2 text-sm flex-grow">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <span className="text-slate-500 text-xs block">
                        Visit Date
                      </span>
                      <span className="text-slate-700 font-medium">
                        {formatDate(request.visitDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <span className="text-slate-500 text-xs block">
                        Purpose
                      </span>
                      <span className="text-slate-700">{request.purpose}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 mb-1">
                      Requested by
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-600" />
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-slate-700 block">
                          {request.residentName}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Home className="w-3 h-3" />
                          <span>
                            {request.block}-{request.roomNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {request.status === "PENDING" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md transition-colors text-sm font-medium"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors text-sm font-medium"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VisitorsApproval;
