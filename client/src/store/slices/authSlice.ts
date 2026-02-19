import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roomNumber?: string;
  blockName?: string;
  blockId?: string;
  roomId?: string;
  organizationId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null; // Access Token (Short lived)
  refreshToken: string | null; // NEW: Refresh Token (Long lived)
  isAuthenticated: boolean;
}

// Helper to safely get user
const getUserFromStorage = (): User | null => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    return null;
  }
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"), // Load from storage
  // Fix: Set to true if we successfully loaded a token
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 1. LOGIN SUCCESS
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
      }>,
    ) => {
      const { user, token, refreshToken } = action.payload;

      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken; // Store it
      state.isAuthenticated = true;

      // Persist all 3
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
    },

    // 2. SILENT REFRESH (New Access Token only)
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },

    // 3. LOGOUT
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const { setCredentials, updateAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: any) => state.auth.user;
export const selectCurrentToken = (state: any) => state.auth.token;
export const selectRefreshToken = (state: any) => state.auth.refreshToken;
