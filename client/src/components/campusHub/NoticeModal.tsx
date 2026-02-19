import React, { useState, useEffect } from "react";
import { X, Calendar, AlertTriangle, Info, Clock, Loader2 } from "lucide-react";
import api from "../../services/api";

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  notice?: any; // If provided, it's edit mode
  initialType?: "ANNOUNCEMENT" | "SCHEDULE" | "EMERGENCY"; // Default type if creating new
}

const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  notice,
  initialType = "ANNOUNCEMENT",
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: initialType,
    scheduledFor: "",
  });

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title,
        description: notice.description || "",
        type: notice.type,
        scheduledFor: notice.scheduledFor
          ? notice.scheduledFor.slice(0, 16)
          : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        type: initialType,
        scheduledFor: "",
      });
    }
  }, [notice, isOpen, initialType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (notice) {
        await api.patch(`/campus-hub/notice/${notice.id}`, formData);
      } else {
        await api.post("/campus-hub/notice", formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save notice", error);
    } finally {
      setLoading(false);
    }
  };

  const isSchedule = formData.type === "SCHEDULE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {notice
              ? `Edit ${isSchedule ? "Schedule" : "Notice"}`
              : `Create New ${isSchedule ? "Schedule" : "Notice"}`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder={
                isSchedule ? "e.g., Waste Collection" : "e.g., No Water Supply"
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, type: "ANNOUNCEMENT" })
                }
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  formData.type === "ANNOUNCEMENT"
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Info className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">General</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "EMERGENCY" })}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  formData.type === "EMERGENCY"
                    ? "bg-red-50 border-red-200 text-red-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <AlertTriangle className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Urgent</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "SCHEDULE" })}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  formData.type === "SCHEDULE"
                    ? "bg-green-50 border-green-200 text-green-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Clock className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Schedule</span>
              </button>
            </div>
          </div>

          {isSchedule && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Scheduled For
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  type="datetime-local"
                  required={isSchedule}
                  value={formData.scheduledFor}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledFor: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              placeholder="Additional details..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {notice ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeModal;
