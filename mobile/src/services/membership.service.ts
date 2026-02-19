import { api } from "./api";

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY";
  description?: string;
  isActive: boolean;
  tier?: string; // Frontend often expects 'tier' but backend sends 'name'. We might need to map it or use name as tier.
  // Library specific
  maxBooksAllowed?: number;
  finePerDay?: number;
  // Gym specific
  hasTrainer?: boolean;
  accessHours?: string;
}

export interface Membership {
  id: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING_PAYMENT";
  startDate: string;
  endDate: string;
  planName: string;
  plan?: Plan; // Populated partially from join if needed, or matched
}

export interface MembershipService {
  getLibraryPlans: () => Promise<Plan[]>;
  getGymPlans: () => Promise<Plan[]>;
  subscribeToPlan: (
    planId: string,
    type: "LIBRARY" | "GYM",
  ) => Promise<{ payment: any; membership: any }>;
  getMyMemberships: () => Promise<{
    library: Membership[];
    gym: Membership[];
  }>;
}

export const membershipService: MembershipService = {
  getLibraryPlans: async () => {
    try {
      const response = await api.get("/memberships/plans?type=LIBRARY");
      return response.data;
    } catch (error) {
      console.error("Error fetching library plans:", error);
      throw error;
    }
  },

  getGymPlans: async () => {
    try {
      const response = await api.get("/memberships/plans?type=GYM");
      return response.data;
    } catch (error) {
      console.error("Error fetching gym plans:", error);
      throw error;
    }
  },

  subscribeToPlan: async (planId: string, type: "LIBRARY" | "GYM") => {
    try {
      const response = await api.post("/memberships/subscribe", {
        planId,
        type,
      });
      return response.data;
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      throw error;
    }
  },

  getMyMemberships: async () => {
    try {
      const response = await api.get("/memberships/my");
      return response.data;
    } catch (error) {
      console.error("Error fetching my memberships:", error);
      throw error;
    }
  },
};
