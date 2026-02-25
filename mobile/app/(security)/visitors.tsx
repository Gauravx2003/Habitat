import React from "react";
import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VisitorVerificationList } from "../../components/visitors/VisitorVerificationList";

export default function SecurityVisitorsTab() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Today's Visitors</Text>
      <VisitorVerificationList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    padding: 20,
  },
  content: {
    padding: 20,
    gap: 20,
  },
});
