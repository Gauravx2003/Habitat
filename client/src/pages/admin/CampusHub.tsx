import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Calendar,
  Bell,
  Clock,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Info,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import EventModal from "../../components/campusHub/EventModal";
import NoticeModal from "../../components/campusHub/NoticeModal";

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  category: string;
  bannerUrl?: string;
}

interface Notice {
  id: string;
  title: string;
  description?: string;
  type: "ANNOUNCEMENT" | "EMERGENCY" | "SCHEDULE";
  scheduledFor?: string;
  isActive: boolean;
  createdAt: string;
}

const CampusHub = () => {
  const [activeTab, setActiveTab] = useState<"events" | "notices" | "schedule">(
    "events",
  );
  const [data, setData] = useState<{
    events: Event[];
    notices: Notice[];
    schedule: Notice[];
  }>({ events: [], notices: [], schedule: [] });
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null); // For editing
  const [noticeType, setNoticeType] = useState<"ANNOUNCEMENT" | "SCHEDULE">(
    "ANNOUNCEMENT",
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/campus-hub/data");
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch campus hub data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (type: "event" | "notice", id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      if (type === "event") {
        await api.delete(`/campus-hub/event/${id}`);
      } else {
        await api.delete(`/campus-hub/notice/${id}`);
      }
      fetchData();
    } catch (error) {
      console.error("Failed to delete item", error);
    }
  };

  const openEditModal = (item: any, type: "event" | "notice" | "schedule") => {
    setSelectedItem(item);
    if (type === "event") {
      setIsEventModalOpen(true);
    } else {
      setNoticeType(type === "schedule" ? "SCHEDULE" : "ANNOUNCEMENT");
      setIsNoticeModalOpen(true);
    }
  };

  const openCreateModal = (type: "event" | "notice" | "schedule") => {
    setSelectedItem(null);
    if (type === "event") {
      setIsEventModalOpen(true);
    } else {
      setNoticeType(type === "schedule" ? "SCHEDULE" : "ANNOUNCEMENT");
      setIsNoticeModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Campus Hub Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage events, notices, and schedules for the hostel
          </p>
        </div>
        <button
          onClick={() =>
            openCreateModal(
              activeTab === "events"
                ? "event"
                : activeTab === "notices"
                  ? "notice"
                  : "schedule",
            )
          }
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add{" "}
          {activeTab === "events"
            ? "Event"
            : activeTab === "notices"
              ? "Notice"
              : "Schedule"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "events"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Events
        </button>
        <button
          onClick={() => setActiveTab("notices")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "notices"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Bell className="w-4 h-4" />
          Notices
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "schedule"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Clock className="w-4 h-4" />
          Schedules
        </button>
      </div>

      {/* Content */}
      <div className="grid gap-4">
        {activeTab === "events" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.events.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                No events found. Create one to get started!
              </div>
            ) : (
              data.events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {event.bannerUrl ? (
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-slate-100 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                        {event.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3 flex-1">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-sm text-slate-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location || "TBA"}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-auto">
                      <button
                        onClick={() => openEditModal(event, "event")}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete("event", event.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "notices" && (
          <div className="space-y-3">
            {data.notices.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No notices found.
              </div>
            ) : (
              data.notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`bg-white p-4 rounded-xl border flex items-start gap-4 ${
                    notice.type === "EMERGENCY"
                      ? "border-red-200 bg-red-50/50"
                      : "border-slate-200"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      notice.type === "EMERGENCY"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {notice.type === "EMERGENCY" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-slate-800">
                        {notice.title}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {notice.description}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(notice, "notice")}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete("notice", notice.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-3">
            {data.schedule.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No scheduled items found.
              </div>
            ) : (
              data.schedule.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 hover:shadow-sm transition-shadow"
                >
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-slate-800">
                        {item.title}
                      </h3>
                      {item.scheduledFor && (
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                          {new Date(item.scheduledFor).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(item, "schedule")}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete("notice", item.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSuccess={fetchData}
        event={selectedItem}
      />

      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onSuccess={fetchData}
        notice={selectedItem}
        initialType={noticeType}
      />
    </div>
  );
};

export default CampusHub;
