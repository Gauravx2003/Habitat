import api from "./api";

export interface ComplaintCategory {
  id: string;
  name: string;
  slaHours: number;
}

export const getComplaintCategories = async (): Promise<
  ComplaintCategory[]
> => {
  const response = await api.get("/complaints/categories");
  return response.data;
};

export const createComplaint = async (
  title: string,
  description: string,
  categoryId: string,
  roomId: string
) => {
  const response = await api.post("/complaints", {
    title,
    description,
    categoryId,
    roomId,
  });
  return response.data;
};

export const uploadComplaintAttachment = async (
  complaintId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(
    `/complaints/${complaintId}/attachments`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
