import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreateMenuForm } from "../../components/smartMess/CreateMenuForm";
import { DashboardHeader } from "../../components/DashboardHeader";
import { useSelector } from "react-redux";
// @ts-ignore
import { RootState } from "../../src/store/store";

export default function SecurityMessTab() {
  const user = useSelector((state: RootState) => state.auth.user);
  const userName = user?.name || "Security";

  return (
    <SafeAreaView style={styles.container}>
      {/* Basic Dashboard Header Matching */}

      {/* Main Form Content */}
      <View style={styles.content}>
        <CreateMenuForm />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  content: {
    flex: 1,
  },
});
