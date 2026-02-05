import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

// Dummy Data
const BORROWED_BOOKS = [
  {
    id: "1",
    title: "Clean Architecture",
    author: "Robert Martin",
    dueDate: "Feb 10, 2026",
    cover: "https://m.media-amazon.com/images/I/41-sN-mzwKL.jpg",
  },
  {
    id: "2",
    title: "Intro to Algorithms",
    author: "Cormen",
    dueDate: "Feb 15, 2026",
    cover: "https://m.media-amazon.com/images/I/41SNoh5ZhOL._SY445_SX342_.jpg",
  },
];

const HISTORY_BOOKS = [
  {
    id: "3",
    title: "React Native in Action",
    author: "Dabit",
    returnDate: "Jan 20, 2026",
  },
  {
    id: "4",
    title: "The Pragmatic Programmer",
    author: "Andy Hunt",
    returnDate: "Dec 15, 2025",
  },
];

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState("current");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity style={styles.scanBtn}>
          <Feather name="maximize" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. Digital Membership Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.cardLabel}>HABITAT LIBRARY</Text>
                <Text style={styles.cardName}>Gaurav Daware</Text>
                <Text style={styles.cardId}>ID: 2022-CS-045</Text>
              </View>
              <View style={styles.cardPhotoPlaceholder}>
                <Feather name="user" size={24} color="white" />
              </View>
            </View>
            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.cardLabel}>MEMBERSHIP STATUS</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>ACTIVE</Text>
                </View>
              </View>
              <Feather
                name="bar-chart-2"
                size={32}
                color="rgba(255,255,255,0.5)"
                style={{ transform: [{ rotate: "90deg" }] }}
              />
            </View>
          </View>
        </View>

        {/* 2. Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search for books..."
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* 3. Toggle Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setActiveTab("current")}
            style={styles.tabItem}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "current" ? styles.tabTextActive : null,
              ]}
            >
              Borrowed (2)
            </Text>
            {activeTab === "current" && <View style={styles.activeLine} />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("history")}
            style={styles.tabItem}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "history" ? styles.tabTextActive : null,
              ]}
            >
              History
            </Text>
            {activeTab === "history" && <View style={styles.activeLine} />}
          </TouchableOpacity>
        </View>

        {/* 4. Book List */}
        <View style={styles.listContainer}>
          {activeTab === "current"
            ? BORROWED_BOOKS.map((book) => (
                <View key={book.id} style={styles.bookItem}>
                  <View style={styles.bookCover}>
                    {/* Fallback icon if image fails */}
                    <Feather name="book" size={24} color="#CBD5E1" />
                  </View>
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{book.title}</Text>
                    <Text style={styles.bookAuthor}>{book.author}</Text>
                    <Text style={styles.bookDue}>Due: {book.dueDate}</Text>
                  </View>
                  <TouchableOpacity style={styles.renewBtn}>
                    <Text style={styles.renewText}>Renew</Text>
                  </TouchableOpacity>
                </View>
              ))
            : HISTORY_BOOKS.map((book) => (
                <View key={book.id} style={[styles.bookItem, { opacity: 0.7 }]}>
                  <View
                    style={[styles.bookCover, { backgroundColor: "#E2E8F0" }]}
                  >
                    <Feather name="check" size={24} color="#64748B" />
                  </View>
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{book.title}</Text>
                    <Text style={styles.bookAuthor}>{book.author}</Text>
                    <Text style={styles.bookReturned}>
                      Returned: {book.returnDate}
                    </Text>
                  </View>
                </View>
              ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#0F172A" },
  scanBtn: { backgroundColor: "#DBEAFE", padding: 10, borderRadius: 12 },

  // Card
  cardContainer: { marginBottom: 24 },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    minHeight: 180,
    justifyContent: "space-between",
    shadowColor: "#1E293B",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardName: { fontSize: 20, color: "white", fontWeight: "bold" },
  cardId: { fontSize: 14, color: "#CBD5E1", marginTop: 2 },
  cardPhotoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  activeBadge: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  activeText: { color: "white", fontSize: 10, fontWeight: "800" },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: "#0F172A" },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabItem: { marginRight: 24, paddingBottom: 10 },
  tabText: { fontSize: 16, color: "#64748B", fontWeight: "600" },
  tabTextActive: { color: "#2563EB", fontWeight: "700" },
  activeLine: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#2563EB",
  },

  // List
  listContainer: { paddingBottom: 40 },
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  bookCover: {
    width: 50,
    height: 70,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  bookInfo: { flex: 1 },
  bookTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  bookAuthor: { fontSize: 14, color: "#64748B" },
  bookDue: { fontSize: 12, color: "#DC2626", fontWeight: "600", marginTop: 4 },
  bookReturned: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "600",
    marginTop: 4,
  },
  renewBtn: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  renewText: { color: "#2563EB", fontSize: 12, fontWeight: "600" },
});
