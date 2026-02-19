import { api } from "./api";

export interface CampusHubData {
  events: Event[];
  notices: Notice[];
  schedule: ScheduleItem[];
}

export interface Event {
  id: string;
  hostelId: string;
  title: string;
  description: string;
  category: "CULTURAL" | "SPORTS" | "WORKSHOP" | "MEETUP" | "OTHER";
  bannerUrl?: string; // Cloudinary URL
  startDate: string; // ISO Date String
  endDate?: string | null;
  location: string;
  interestedCount: number;
  createdAt: string;
}

export interface Notice {
  id: string;
  hostelId: string;
  title: string;
  description: string;
  type: "ANNOUNCEMENT" | "EMERGENCY" | "SCHEDULE";
  scheduledFor?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ScheduleItem extends Notice {
  type: "SCHEDULE";
}

export const getCampusHubData = async (): Promise<CampusHubData> => {
  const response = await api.get<CampusHubData>("/campus-hub/data");
  return response.data;
};
