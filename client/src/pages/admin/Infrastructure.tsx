import { useEffect, useState } from "react";
import {
  getBlocksOverview,
  getOccupancyStats,
  getRoomTypes,
  createRoomType,
  addRoomsToBlock,
  createBlockWithMixedRooms,
  type BlockOverview,
  type OccupancyStats,
  type RoomType,
} from "../../services/infrastructure.service";
import {
  Building2,
  Home,
  Users,
  TrendingUp,
  Plus,
  ChevronDown,
  ChevronRight,
  X,
  Layers,
  DoorOpen,
  BarChart3,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const Infrastructure = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "manage">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [blocksData, setBlocksData] = useState<BlockOverview[]>([]);
  const [stats, setStats] = useState<OccupancyStats | null>(null);
  const [roomTypesList, setRoomTypesList] = useState<RoomType[]>([]);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  // Modal states
  const [showAddRooms, setShowAddRooms] = useState(false);
  const [showNewRoomType, setShowNewRoomType] = useState(false);
  const [showNewBlock, setShowNewBlock] = useState(false);

  // Form states
  const [addRoomForm, setAddRoomForm] = useState({
    blockId: "",
    typeId: "",
    from: "",
    to: "",
  });
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: "",
    price: "",
    capacity: "",
    description: "",
  });
  const [newBlockForm, setNewBlockForm] = useState({
    name: "",
    configurations: [{ typeId: "", from: "", to: "" }],
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [b, s, rt] = await Promise.all([
        getBlocksOverview(),
        getOccupancyStats(),
        getRoomTypes(),
      ]);
      setBlocksData(b);
      setStats(s);
      setRoomTypesList(rt);
    } catch (error) {
      console.error("Failed to load infrastructure data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ─── Handlers ───
  // Helper: generate room number strings from a range
  const generateRange = (from: string, to: string): string[] => {
    const start = parseInt(from);
    const end = parseInt(to);
    if (isNaN(start) || isNaN(end) || start > end) return [];
    const result: string[] = [];
    for (let i = start; i <= end; i++) result.push(String(i));
    return result;
  };

  const handleAddRooms = async () => {
    if (
      !addRoomForm.blockId ||
      !addRoomForm.typeId ||
      !addRoomForm.from ||
      !addRoomForm.to
    )
      return;
    setFormError("");
    const nums = generateRange(addRoomForm.from, addRoomForm.to);
    if (nums.length === 0) {
      setFormError("Invalid range. 'From' must be ≤ 'To'.");
      return;
    }
    try {
      setIsSubmitting(true);
      await addRoomsToBlock({
        blockId: addRoomForm.blockId,
        typeId: addRoomForm.typeId,
        roomNumbers: nums,
      });
      setShowAddRooms(false);
      setAddRoomForm({ blockId: "", typeId: "", from: "", to: "" });
      setFormError("");
      fetchAll();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg) setFormError(msg);
      else console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRoomType = async () => {
    if (!roomTypeForm.name || !roomTypeForm.price || !roomTypeForm.capacity)
      return;
    try {
      setIsSubmitting(true);
      await createRoomType({
        name: roomTypeForm.name,
        price: parseInt(roomTypeForm.price),
        capacity: parseInt(roomTypeForm.capacity),
        description: roomTypeForm.description || undefined,
      });
      setShowNewRoomType(false);
      setRoomTypeForm({ name: "", price: "", capacity: "", description: "" });
      fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBlock = async () => {
    if (!newBlockForm.name) return;
    setFormError("");
    const configs = newBlockForm.configurations
      .filter((c) => c.typeId && c.from && c.to)
      .map((c) => ({
        typeId: c.typeId,
        roomNumbers: generateRange(c.from, c.to),
      }));
    if (
      configs.length === 0 ||
      configs.some((c) => c.roomNumbers.length === 0)
    ) {
      setFormError("Invalid range in one or more configurations.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createBlockWithMixedRooms({
        name: newBlockForm.name,
        configurations: configs,
      });
      setShowNewBlock(false);
      setNewBlockForm({
        name: "",
        configurations: [{ typeId: "", from: "", to: "" }],
      });
      setFormError("");
      fetchAll();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg) setFormError(msg);
      else console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Chart Data ───
  const barChartData = blocksData.map((b) => ({
    name: b.name,
    Occupied: b.occupiedRooms,
    Vacant: b.totalRooms - b.occupiedRooms,
  }));

  const pieChartData =
    stats?.byType.map((t) => ({
      name: t.typeName,
      value: t.total,
    })) || [];

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Infrastructure
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage hostel blocks, rooms, and view occupancy statistics
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </div>
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "manage"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Manage
          </div>
        </button>
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Home className="w-5 h-5 text-indigo-600" />}
              label="Total Rooms"
              value={stats.totalRooms}
              bg="bg-indigo-50"
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-emerald-600" />}
              label="Occupied"
              value={stats.occupiedRooms}
              bg="bg-emerald-50"
            />
            <StatCard
              icon={<DoorOpen className="w-5 h-5 text-amber-600" />}
              label="Vacant"
              value={stats.vacantRooms}
              bg="bg-amber-50"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-rose-600" />}
              label="Occupancy Rate"
              value={`${stats.occupancyRate}%`}
              bg="bg-rose-50"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart — Block Occupancy */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Block Occupancy
              </h3>
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "13px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="Occupied"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Vacant"
                      fill="#e2e8f0"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">
                  No block data available
                </div>
              )}
            </div>

            {/* Pie Chart — Room Type Distribution */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Room Type Distribution
              </h3>
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent as any) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {pieChartData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "13px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">
                  No room type data available
                </div>
              )}
            </div>
          </div>

          {/* Per-Type Breakdown Table */}
          {stats.byType.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">
                  Occupancy by Room Type
                </h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-slate-100">
                    <th className="text-left px-5 py-3 font-medium">
                      Room Type
                    </th>
                    <th className="text-center px-5 py-3 font-medium">Total</th>
                    <th className="text-center px-5 py-3 font-medium">
                      Occupied
                    </th>
                    <th className="text-center px-5 py-3 font-medium">
                      Vacant
                    </th>
                    <th className="text-right px-5 py-3 font-medium">
                      Occupancy %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byType.map((t) => {
                    const pct =
                      t.total > 0
                        ? Math.round((t.occupied / t.total) * 100)
                        : 0;
                    return (
                      <tr
                        key={t.typeId}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-5 py-3 text-sm font-medium text-slate-800">
                          {t.typeName}
                        </td>
                        <td className="px-5 py-3 text-sm text-center text-slate-600">
                          {t.total}
                        </td>
                        <td className="px-5 py-3 text-sm text-center text-slate-600">
                          {t.occupied}
                        </td>
                        <td className="px-5 py-3 text-sm text-center text-slate-600">
                          {t.total - t.occupied}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
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
          )}
        </div>
      )}

      {/* ─── MANAGE TAB ─── */}
      {activeTab === "manage" && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddRooms(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Rooms
            </button>
            <button
              onClick={() => setShowNewRoomType(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Room Type
            </button>
            <button
              onClick={() => setShowNewBlock(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <Building2 className="w-4 h-4" />
              New Block
            </button>
          </div>

          {/* Room Types List */}
          {roomTypesList.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">
                  Room Types
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100">
                {roomTypesList.map((rt) => (
                  <div key={rt.id} className="bg-white p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {rt.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Capacity: {rt.capacity ?? 1}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">
                        ₹{rt.price?.toLocaleString()}/mo
                      </span>
                      {rt.description && (
                        <span className="text-xs text-slate-400 truncate max-w-[120px]">
                          {rt.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Block Cards */}
          {blocksData.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                No blocks found. Create your first block to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {blocksData.map((block) => {
                const isExpanded = expandedBlock === block.id;
                const occupancyPct =
                  block.totalRooms > 0
                    ? Math.round((block.occupiedRooms / block.totalRooms) * 100)
                    : 0;

                return (
                  <div
                    key={block.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  >
                    {/* Block Header */}
                    <button
                      onClick={() =>
                        setExpandedBlock(isExpanded ? null : block.id)
                      }
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-semibold text-slate-800">
                            {block.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {block.totalRooms} rooms · {block.occupiedRooms}{" "}
                            occupied
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{ width: `${occupancyPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-500 w-8">
                            {occupancyPct}%
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 px-5 py-4">
                        {block.roomTypes.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-4">
                            No rooms in this block yet
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {block.roomTypes.map((rt) => (
                              <div
                                key={rt.typeId}
                                className="border border-slate-100 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-slate-700">
                                    {rt.typeName}
                                  </span>
                                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                    Cap: {rt.capacity}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>
                                    {rt.occupiedRooms}/{rt.totalRooms} occupied
                                  </span>
                                  <span>₹{rt.price?.toLocaleString()}/mo</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-400 rounded-full"
                                    style={{
                                      width: `${rt.totalRooms > 0 ? Math.round((rt.occupiedRooms / rt.totalRooms) * 100) : 0}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── MODALS ─── */}

      {showAddRooms && (
        <Modal
          title="Add Rooms to Block"
          onClose={() => {
            setShowAddRooms(false);
            setFormError("");
          }}
        >
          <div className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Block
              </label>
              <select
                value={addRoomForm.blockId}
                onChange={(e) =>
                  setAddRoomForm((f) => ({ ...f, blockId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select block</option>
                {blocksData.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Room Type
              </label>
              <select
                value={addRoomForm.typeId}
                onChange={(e) =>
                  setAddRoomForm((f) => ({ ...f, typeId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select room type</option>
                {roomTypesList.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name} (Cap: {rt.capacity ?? 1})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Room Number Range
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={addRoomForm.from}
                  onChange={(e) =>
                    setAddRoomForm((f) => ({ ...f, from: e.target.value }))
                  }
                  placeholder="From (e.g. 101)"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-slate-400 font-medium">to</span>
                <input
                  type="number"
                  value={addRoomForm.to}
                  onChange={(e) =>
                    setAddRoomForm((f) => ({ ...f, to: e.target.value }))
                  }
                  placeholder="To (e.g. 120)"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {addRoomForm.from &&
                addRoomForm.to &&
                parseInt(addRoomForm.from) <= parseInt(addRoomForm.to) && (
                  <p className="text-xs text-slate-400 mt-1">
                    Will create{" "}
                    {parseInt(addRoomForm.to) - parseInt(addRoomForm.from) + 1}{" "}
                    rooms ({addRoomForm.from}–{addRoomForm.to})
                  </p>
                )}
            </div>
            <button
              onClick={handleAddRooms}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Rooms"}
            </button>
          </div>
        </Modal>
      )}

      {/* New Room Type Modal */}
      {showNewRoomType && (
        <Modal
          title="Create Room Type"
          onClose={() => setShowNewRoomType(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name
              </label>
              <input
                value={roomTypeForm.name}
                onChange={(e) =>
                  setRoomTypeForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Deluxe Single"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Price (₹/mo)
                </label>
                <input
                  type="number"
                  value={roomTypeForm.price}
                  onChange={(e) =>
                    setRoomTypeForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="5000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={roomTypeForm.capacity}
                  onChange={(e) =>
                    setRoomTypeForm((f) => ({
                      ...f,
                      capacity: e.target.value,
                    }))
                  }
                  placeholder="2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={roomTypeForm.description}
                onChange={(e) =>
                  setRoomTypeForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <button
              onClick={handleCreateRoomType}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Room Type"}
            </button>
          </div>
        </Modal>
      )}

      {/* New Block Modal */}
      {showNewBlock && (
        <Modal
          title="Create New Block"
          onClose={() => {
            setShowNewBlock(false);
            setFormError("");
          }}
        >
          <div className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Block Name
              </label>
              <input
                value={newBlockForm.name}
                onChange={(e) =>
                  setNewBlockForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Block E"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Room Configurations
              </label>
              {newBlockForm.configurations.map((c, i) => (
                <div
                  key={i}
                  className="border border-slate-100 rounded-lg p-3 mb-2"
                >
                  <div className="flex gap-2 mb-2">
                    <select
                      value={c.typeId}
                      onChange={(e) => {
                        const configs = [...newBlockForm.configurations];
                        configs[i].typeId = e.target.value;
                        setNewBlockForm((f) => ({
                          ...f,
                          configurations: configs,
                        }));
                      }}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Room type</option>
                      {roomTypesList.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name}
                        </option>
                      ))}
                    </select>
                    {newBlockForm.configurations.length > 1 && (
                      <button
                        onClick={() => {
                          const configs = newBlockForm.configurations.filter(
                            (_, idx) => idx !== i,
                          );
                          setNewBlockForm((f) => ({
                            ...f,
                            configurations: configs,
                          }));
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={c.from}
                      onChange={(e) => {
                        const configs = [...newBlockForm.configurations];
                        configs[i].from = e.target.value;
                        setNewBlockForm((f) => ({
                          ...f,
                          configurations: configs,
                        }));
                      }}
                      placeholder="From (e.g. 101)"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-slate-400 font-medium text-sm">
                      to
                    </span>
                    <input
                      type="number"
                      value={c.to}
                      onChange={(e) => {
                        const configs = [...newBlockForm.configurations];
                        configs[i].to = e.target.value;
                        setNewBlockForm((f) => ({
                          ...f,
                          configurations: configs,
                        }));
                      }}
                      placeholder="To (e.g. 120)"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {c.from && c.to && parseInt(c.from) <= parseInt(c.to) && (
                    <p className="text-xs text-slate-400 mt-1">
                      {parseInt(c.to) - parseInt(c.from) + 1} rooms ({c.from}–
                      {c.to})
                    </p>
                  )}
                </div>
              ))}
              <button
                onClick={() =>
                  setNewBlockForm((f) => ({
                    ...f,
                    configurations: [
                      ...f.configurations,
                      { typeId: "", from: "", to: "" },
                    ],
                  }))
                }
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 mt-1"
              >
                <Plus className="w-3 h-3" />
                Add another room type
              </button>
            </div>

            <button
              onClick={handleCreateBlock}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Block"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Reusable Components ───

const StatCard = ({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bg: string;
}) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5">
    <div className="flex items-center gap-3 mb-3">
      <div
        className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}
      >
        {icon}
      </div>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-lg w-full p-6 border-2 border-slate-200 shadow-xl">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Infrastructure;
