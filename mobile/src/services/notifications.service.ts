import { api } from "./api";

export const notificationsService = {
  updatePushToken: async (token: string) => {
    const response = await api.patch("/users/push-token", { token });
    return response.data;
  },
};
