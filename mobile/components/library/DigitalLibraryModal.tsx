import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LibraryBook } from "../../src/services/library.service";

interface DigitalLibraryModalProps {
  visible: boolean;
  onClose: () => void;
  books: LibraryBook[];
  onDownload: (book: LibraryBook) => void;
}

export const DigitalLibraryModal: React.FC<DigitalLibraryModalProps> = ({
  visible,
  onClose,
  books,
  onDownload,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.digitalLibraryContainer}>
        <View style={styles.digitalLibraryHeader}>
          <TouchableOpacity onPress={onClose}>
            <Feather name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.digitalLibraryTitle}>Digital Library</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.digitalLibrarySearch}>
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search digital books..."
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <ScrollView style={styles.digitalLibraryContent}>
          <Text style={styles.sectionTitle}>Available E-Books</Text>
          {books.map((book) => (
            <View key={book.id} style={styles.digitalBookCard}>
              <View style={styles.digitalBookIcon}>
                <Feather
                  name={
                    book.format === "AUDIOBOOK" ? "headphones" : "file-text"
                  }
                  size={32}
                  color="#7C3AED"
                />
              </View>
              <View style={styles.digitalBookInfo}>
                <Text style={styles.digitalBookTitle}>{book.title}</Text>
                <Text style={styles.digitalBookAuthor}>{book.author}</Text>
                <View style={styles.digitalBookMeta}>
                  <View style={styles.formatBadge}>
                    <Text style={styles.formatText}>{book.format}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.digitalDownloadBtn}
                onPress={() => onDownload(book)}
              >
                <Feather name="download" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          {books.length === 0 && (
            <Text
              style={{ textAlign: "center", marginTop: 20, color: "#64748B" }}
            >
              No digital books available.
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  digitalLibraryContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  digitalLibraryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  digitalLibraryTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  digitalLibrarySearch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: "#0F172A" },
  digitalLibraryContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  digitalBookCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  digitalBookIcon: {
    width: 60,
    height: 80,
    backgroundColor: "#F3E8FF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  digitalBookInfo: {
    flex: 1,
  },
  digitalBookTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  digitalBookAuthor: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  digitalBookMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  formatBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  formatText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB",
  },
  digitalDownloadBtn: {
    backgroundColor: "#7C3AED",
    padding: 12,
    borderRadius: 12,
  },
});
