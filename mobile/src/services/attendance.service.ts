import { api } from "./api";

export const generateQr = async () => {
  const response = await api.get("/attendance/generate-qr");
  return response.data;
};

export const markAttendance = async (qrData: string) => {
  const response = await api.post("/attendance/verify-qr", { token: qrData });
  return response.data;
};
