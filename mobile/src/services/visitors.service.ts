import { api } from "./api";

export interface VisitorRequest {
  id: string;
  visitorName: string;
  visitorPhone: string;
  relation: string;
  purpose: string;
  visitDate: string;
  entryCode: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CLOSED";
  createdAt: string;
  // Joined fields from getTodaysVisitors
  residentName?: string;
  block?: string;
  roomNumber?: string;
  phone?: string;
}

export const visitorsService = {
  createRequest: async (data: {
    visitorName: string;
    visitorPhone: string;
    relation: string;
    purpose: string;
    visitDate: string;
  }) => {
    const response = await api.post("/visitors/create", data);
    return response.data;
  },

  getMyRequests: async () => {
    const response = await api.get<VisitorRequest[]>("/visitors/my-requests");
    return response.data;
  },

  getTodaysVisitors: async () => {
    const response = await api.get<VisitorRequest[]>("/visitors/today");
    return response.data;
  },

  verifyVisitor: async (visitorId: string, entryCode: string) => {
    const response = await api.post("/visitors/verify", {
      visitorId,
      entryCode,
    });
    return response.data;
  },
};
