import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  raiseComplaint,
  ComplaintCategory,
} from "@/src/services/complaints.service";

interface Props {
  categories: ComplaintCategory[];
  roomId?: string;
  /** Called after a successful submission so the parent can switch tabs & refresh */
  onSubmitSuccess: () => void;
}

export function ComplaintForm({ categories, roomId, onSubmitSuccess }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !desc || !selectedCategory) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (!roomId) {
      Alert.alert("Error", "Room ID not found. Please contact admin.");
      return;
    }

    try {
      setSubmitting(true);
      await raiseComplaint({
        categoryId: selectedCategory,
        title,
        description: desc,
        roomId,
      });
      Alert.alert("Success", "Complaint raised successfully!");
      setTitle("");
      setDesc("");
      setSelectedCategory("");
      onSubmitSuccess();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to raise complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.formContainer}>
          <Text className="font-sn-pro-bold" style={styles.label}>
            Issue Category
          </Text>
          <View style={styles.chipContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.chip,
                  selectedCategory === cat.id
                    ? styles.chipActive
                    : styles.chipInactive,
                ]}
              >
                <Text
                  className="font-sn-pro-medium"
                  style={
                    selectedCategory === cat.id
                      ? styles.chipTextActive
                      : styles.chipTextInactive
                  }
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="font-sn-pro-bold" style={styles.label}>
            Subject
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Fan not working"
            value={title}
            onChangeText={setTitle}
          />

          <Text className="font-sn-pro-bold" style={styles.label}>
            Description
          </Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            placeholder="Describe details..."
            multiline
            value={desc}
            onChangeText={setDesc}
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-sn-pro-bold" style={styles.submitBtnText}>
                Submit Complaint
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 40,
  },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: { color: "white", fontSize: 16 },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  chipInactive: { backgroundColor: "white", borderColor: "#E5E7EB" },
  chipTextActive: { color: "white", fontWeight: "500" },
  chipTextInactive: { color: "#4B5563", fontWeight: "500" },
});
