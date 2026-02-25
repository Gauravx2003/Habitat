import { useState, useEffect } from "react";
import { X, Loader2, UserPlus, Building, Home } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/slices/authSlice";
import {
  createResident,
  getHostelBlocks,
  getBlockRooms,
  getRoomTypesByBlock,
} from "../services/userCreation.service";

interface CreateResidentModalProps {
  onClose: () => void;
  onSuccess: (email: string, password: string) => void;
}

interface Block {
  id: string;
  name: string;
}

interface Room {
  rooms: {
    id: string;
    roomNumber: string;
    capacity: number;
    currentOccupancy: number;
  };
  room_types: {
    capacity: number;
  };
}

interface RoomType {
  id: string;
  name: string;
  capacity: number | null;
  price: number;
}

const CreateResidentModal = ({
  onClose,
  onSuccess,
}: CreateResidentModalProps) => {
  const user = useSelector(selectCurrentUser);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  // Data state
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Loading states
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(true);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch blocks when modal opens
  useEffect(() => {
    if (user?.hostelId) {
      fetchBlocks();
    }
  }, [user?.hostelId]);

  // Fetch room types when block is selected
  useEffect(() => {
    if (selectedBlockId) {
      fetchRoomTypes(selectedBlockId);
    } else {
      setRoomTypes([]);
      setSelectedRoomTypeId("");
      setRooms([]);
      setSelectedRoomId("");
    }
  }, [selectedBlockId]);

  // Fetch rooms when room type is selected
  useEffect(() => {
    if (selectedBlockId && selectedRoomTypeId) {
      fetchRooms(selectedBlockId, selectedRoomTypeId);
    } else {
      setRooms([]);
      setSelectedRoomId("");
    }
  }, [selectedRoomTypeId]);

  const fetchBlocks = async () => {
    if (!user?.hostelId) return;

    setIsLoadingBlocks(true);
    try {
      const data = await getHostelBlocks(user.hostelId);
      setBlocks(data);
    } catch (error) {
      console.error("Failed to fetch blocks:", error);
      alert("Failed to load blocks. Please try again.");
    } finally {
      setIsLoadingBlocks(false);
    }
  };

  const fetchRoomTypes = async (blockId: string) => {
    setIsLoadingRoomTypes(true);
    try {
      const data = await getRoomTypesByBlock(blockId);
      setRoomTypes(data);
    } catch (error) {
      console.error("Failed to fetch room types:", error);
    } finally {
      setIsLoadingRoomTypes(false);
    }
  };

  const fetchRooms = async (blockId: string, roomTypeId: string) => {
    setIsLoadingRooms(true);
    try {
      const data = await getBlockRooms(blockId, roomTypeId);
      setRooms(data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.hostelId || !user?.organizationId) {
      alert("User information not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createResident(
        {
          hostelId: user.hostelId,
          organizationId: user.organizationId,
        },
        {
          name,
          email,
          phone,
          dateOfBirth,
          roomId: selectedRoomId,
          enrollmentNumber: enrollmentNumber || undefined,
        },
      );

      // Call onSuccess with credentials
      onSuccess(result.email, result.tempPassword);
      onClose();
    } catch (error: any) {
      console.error("Failed to create resident:", error);
      alert(
        error.response?.data?.error ||
          "Failed to create resident. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Create New Resident
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Row 1: Name + Email */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Resident's full name"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  placeholder="resident@example.com"
                />
              </div>
            </div>

            {/* Row 2: Phone + DOB */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Enrollment Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Enrollment Number{" "}
                <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                placeholder="e.g., EN12345"
              />
            </div>

            {/* Row 3: Block + Room Type */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Building className="w-4 h-4 inline mr-1" />
                  Block <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedBlockId}
                  onChange={(e) => setSelectedBlockId(e.target.value)}
                  disabled={isLoadingBlocks}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {isLoadingBlocks ? "Loading blocks..." : "Select a block"}
                  </option>
                  {blocks.map((block) => (
                    <option key={block.id} value={block.id}>
                      {block.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Home className="w-4 h-4 inline mr-1" />
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedRoomTypeId}
                  onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                  disabled={!selectedBlockId || isLoadingRoomTypes}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {!selectedBlockId
                      ? "Select a block first"
                      : isLoadingRoomTypes
                        ? "Loading..."
                        : roomTypes.length === 0
                          ? "No types available"
                          : "Select a room type"}
                  </option>
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Home className="w-4 h-4 inline mr-1" />
                Room <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                disabled={!selectedRoomTypeId || isLoadingRooms}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {!selectedRoomTypeId
                    ? "Select a room type first"
                    : isLoadingRooms
                      ? "Loading rooms..."
                      : rooms.length === 0
                        ? "No available rooms"
                        : "Select a room"}
                </option>
                {rooms.map((room) => (
                  <option key={room?.rooms.id} value={room.rooms.id}>
                    {room.rooms.roomNumber} (Available:{" "}
                    {room.room_types.capacity -
                      (room.rooms.currentOccupancy || 0)}
                    /{room.room_types.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 p-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-white border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Resident"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateResidentModal;
