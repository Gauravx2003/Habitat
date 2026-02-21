import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface ReservationQRModalProps {
  visible: boolean;
  onClose: () => void;
  reservationId: string;
}

export const ReservationQRModal: React.FC<ReservationQRModalProps> = ({
  visible,
  onClose,
  reservationId,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { alignItems: "center", paddingVertical: 40 },
          ]}
        >
          <Text style={styles.modalTitle}>Reservation Ticket</Text>
          <Text
            style={{
              color: "#64748B",
              marginBottom: 24,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Show this QR code to the librarian to collect your physical book.
          </Text>
          {reservationId ? (
            <View
              style={{
                padding: 20,
                backgroundColor: "white",
                borderRadius: 16,
                elevation: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              }}
            >
              <QRCode
                value={reservationId}
                size={200}
                color="#0F172A"
                backgroundColor="white"
              />
            </View>
          ) : null}
          <Text
            style={{
              marginTop: 24,
              fontSize: 18,
              fontWeight: "800",
              color: "#7C3AED",
              letterSpacing: 2,
            }}
          >
            {reservationId.slice(0, 8).toUpperCase()}
          </Text>
          <TouchableOpacity
            style={[styles.closeBtn, { width: "100%", marginTop: 30 }]}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  closeBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
