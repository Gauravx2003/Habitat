import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { rejectResolution } from "@/src/services/complaints.service";

interface Props {
  visible: boolean;
  complaintId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RejectResolutionModal({
  visible,
  complaintId,
  onClose,
  onSuccess,
}: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert("Required", "Please describe what's still wrong.");
      return;
    }
    try {
      setSubmitting(true);
      await rejectResolution(complaintId!, reason.trim());
      setReason("");
      onClose();
      Alert.alert(
        "Escalated",
        "Your complaint has been escalated to the Admin for review.",
      );
      onSuccess();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to reject resolution",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>What's still wrong?</Text>
          <Text style={styles.subtitle}>
            Help us understand why you're not satisfied with the resolution.
            This will be escalated to the Admin.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. The fan is still making noise..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={reason}
            onChangeText={setReason}
            autoFocus
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitText}>Escalate</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 6 },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 18,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    height: 100,
    textAlignVertical: "top",
    color: "#111827",
  },
  actions: { flexDirection: "row", marginTop: 16, gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  cancelText: { color: "#374151", fontWeight: "600", fontSize: 14 },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#DC2626",
  },
  submitText: { color: "white", fontWeight: "600", fontSize: 14 },
});
