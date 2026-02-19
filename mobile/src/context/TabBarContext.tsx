import React, { createContext, useContext } from "react";
import { useSharedValue, SharedValue } from "react-native-reanimated";

interface TabBarContextType {
  tabBarTranslateY: SharedValue<number>;
}

const TabBarContext = createContext<TabBarContextType | null>(null);

export const TabBarProvider = ({ children }: { children: React.ReactNode }) => {
  // 0 = Visible, 100 = Hidden (Moved down by 100px)
  const tabBarTranslateY = useSharedValue(0);

  return (
    <TabBarContext.Provider value={{ tabBarTranslateY }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBarAnimation = () => {
  const context = useContext(TabBarContext);
  if (!context)
    throw new Error("useTabBarAnimation must be used within TabBarProvider");
  return context;
};
