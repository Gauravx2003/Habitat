import { api } from "./api";

export interface MessIssue {
  id: string;
  issueTitle: string;
  issueDescription: string;
  category: "FOOD" | "SERVICE" | "HYGIENE" | "INFRASTRUCTURE" | "OTHER";
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  adminResponse?: string;
  attachments?: { id: string; fileURL: string }[];
  createdAt: string;
}

export interface MessMenu {
  id: string;
  date: string;
  mealType: "BREAKFAST" | "LUNCH" | "SNACKS" | "DINNER";
  items: string;
  servingTime: string;
  cutoffTime: string;
  status?: "OPTED_IN" | "SCANNED" | "MISSED" | null;
  qrToken?: string | null;
}

export const messService = {
  createIssue: async (data: {
    issueTitle: string;
    issueDescription: string;
    category: string;
  }) => {
    const response = await api.post("/mess-issues/create", data);
    return response.data;
  },

  getMyIssues: async () => {
    const response = await api.get<MessIssue[]>("/mess-issues/my");
    return response.data;
  },

  getDailyMenu: async () => {
    const response = await api.get<MessMenu[]>("/smart-mess/menu");
    return response.data;
  },

  optInForMeal: async (menuId: string) => {
    const response = await api.post("/smart-mess/opt-in", { menuId });
    return response.data;
  },

  optOutForMeal: async (menuId: string) => {
    const response = await api.post("/smart-mess/opt-out", { menuId });
    return response.data;
  },

  uploadIssueAttachments: async (issueId: string, imageUris: string[]) => {
    const formData = new FormData();
    imageUris.forEach((uri, index) => {
      formData.append("images", {
        uri,
        name: `issue_image_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    const response = await api.post(
      `/mess-issues/${issueId}/attachments`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },
};
