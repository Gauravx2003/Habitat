import "../global.css";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../src/store/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

// 1. Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    SNProMedium: require("../assets/fonts/SNProMedium.ttf"),
    SNProBold: require("../assets/fonts/SNProBold.ttf"),
    SNProBlack: require("../assets/fonts/SNProBlack.ttf"),
    SNProRegular: require("../assets/fonts/SNProRegular.ttf"),
    SNProExtraBold: require("../assets/fonts/SNProExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // 2. This listener fires when the user TAPS the notification
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        // Check if there is a route in the data
        if (data?.route) {
          console.log("🚀 Redirecting to:", data.route);
          router.push({
            pathname: data.route as any,
            params: data.params as any,
          });
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(resident)" options={{ headerShown: false }} />
          <Stack.Screen name="(security)" options={{ headerShown: false }} />
          <Stack.Screen name="(staff)" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </Provider>
  );
}
