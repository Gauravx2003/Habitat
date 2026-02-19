import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  Button,
  Platform,
  StyleSheet,
  Alert,
  Clipboard,
  TouchableOpacity,
} from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// 1. FIX: Added missing properties (shouldShowBanner, shouldShowList)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NotificationTestScreen() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  // 2. FIX: Initialize refs with null and allow null in type
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const router = useRouter();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token ?? ""),
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
        Alert.alert(
          "Notification Tapped!",
          "You opened the app from a notification.",
        );
      });

    return () => {
      // 3. FIX: Use .remove() on the subscription object
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const copyToken = () => {
    Clipboard.setString(expoPushToken);
    Alert.alert("Copied!", "Token copied to clipboard.");
  };
  const sendLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📬 Local Test",
        body: "This notification was triggered locally!",
        data: { data: "goes here" },
      },
      trigger: {
        type: "timeInterval", // <--- FIXED: Explicitly state the type
        seconds: 2,
        repeats: false,
      } as any,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Feather name="arrow-left" size={24} color="#0F172A" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Feather
          name="bell"
          size={40}
          color="#2563EB"
          style={{ marginBottom: 10 }}
        />
        <Text style={styles.title}>Push Notification Tester</Text>

        <Text style={styles.label}>Your Expo Push Token:</Text>
        <View style={styles.tokenBox}>
          <Text style={styles.tokenText} numberOfLines={2}>
            {expoPushToken || "Fetching token..."}
          </Text>
        </View>

        <Button title="Copy Token" onPress={copyToken} />
      </View>

      <View style={styles.actionArea}>
        <Text style={styles.subTitle}>Test 1: Local Trigger</Text>
        <Text style={styles.desc}>
          Fires a notification from inside the app after 2 seconds.
        </Text>
        <Button
          title="Trigger Local Notification"
          onPress={sendLocalNotification}
        />
      </View>

      <View style={styles.actionArea}>
        <Text style={styles.subTitle}>Test 2: Real Push</Text>
        <Text style={styles.desc}>
          1. Copy the token above.{"\n"}
          2. Go to:{" "}
          <Text style={{ fontWeight: "bold" }}>expo.dev/notifications</Text>
          {"\n"}
          3. Paste token and send.
        </Text>
      </View>

      {notification && (
        <View style={styles.lastNotification}>
          <Text style={{ fontWeight: "bold" }}>Last Received:</Text>
          <Text>Title: {notification.request.content.title}</Text>
          <Text>Body: {notification.request.content.body}</Text>
        </View>
      )}
    </View>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Error", "Failed to get push token for push notification!");
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("🔥 MY PUSH TOKEN:", token);
    } catch (e) {
      console.log("Error fetching token", e);
    }
  } else {
    Alert.alert("Warning", "Must use physical device for Push Notifications");
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  backText: { fontSize: 16, fontWeight: "600", marginLeft: 8 },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    elevation: 5,
    marginTop: 60,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 14, color: "#64748B", marginBottom: 5 },
  tokenBox: {
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
  },
  tokenText: { fontSize: 10, fontFamily: "monospace", color: "#334155" },
  actionArea: { marginBottom: 30, width: "100%", alignItems: "center" },
  subTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  desc: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 10,
    fontSize: 12,
  },
  lastNotification: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#DCFCE7",
    borderRadius: 10,
    width: "100%",
  },
});
