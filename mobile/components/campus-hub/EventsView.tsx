import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Event } from "@/src/services/campusHub.service";

interface Props {
  events: Event[];
  interestedEvents: string[];
  toggleInterest: (id: string) => void;
}

export function EventsView({
  events,
  interestedEvents,
  toggleInterest,
}: Props) {
  if (events.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Feather name="calendar" size={40} color="#D1D5DB" />
        <Text style={styles.emptyStateText}>No upcoming events</Text>
      </View>
    );
  }

  return (
    <View>
      {events.map((event) => {
        const isInterested = interestedEvents.includes(event.id);
        const date = new Date(event.startDate).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const time = new Date(event.startDate).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.imageContainer}>
              {event.bannerUrl ? (
                <Image
                  source={{ uri: event.bannerUrl }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="image" size={40} color="#9CA3AF" />
                </View>
              )}
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{date}</Text>
              </View>
            </View>

            <View style={styles.cardPadding}>
              <Text className="font-sn-pro-bold" style={styles.eventTitle}>
                {event.title}
              </Text>

              <View style={styles.infoRow}>
                <Feather name="calendar" size={14} color="#6B7280" />
                <Text style={styles.infoText}>
                  {date} • {time}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Feather name="map-pin" size={14} color="#6B7280" />
                <Text style={styles.infoText}>{event.location}</Text>
              </View>

              {event.description && (
                <Text style={styles.eventDesc} numberOfLines={2}>
                  {event.description}
                </Text>
              )}

              <TouchableOpacity
                onPress={() => toggleInterest(event.id)}
                style={[
                  styles.interestBtn,
                  isInterested
                    ? styles.interestBtnActive
                    : styles.interestBtnInactive,
                ]}
              >
                <Feather
                  name="heart"
                  size={16}
                  color={isInterested ? "#DB2777" : "white"}
                />
                <Text
                  className="font-sn-pro-bold"
                  style={[
                    styles.interestBtnText,
                    { color: isInterested ? "#DB2777" : "white" },
                  ]}
                >
                  {isInterested ? "Interested!" : "I'm Interested"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyStateText: { color: "#9CA3AF", fontSize: 16, marginTop: 8 },

  eventCard: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 180,
    width: "100%",
    position: "relative",
    backgroundColor: "#E5E7EB",
  },
  bannerImage: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  dateBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateBadgeText: { color: "white", fontSize: 12, fontWeight: "600" },
  cardPadding: { padding: 16 },
  eventTitle: {
    fontSize: 18,
    color: "#111827",
    marginBottom: 8,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoText: { color: "#6B7280", fontSize: 14, marginLeft: 8 },
  eventDesc: { color: "#6B7280", fontSize: 13, marginTop: 4, lineHeight: 18 },
  interestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  interestBtnInactive: { backgroundColor: "#2563EB" },
  interestBtnActive: {
    backgroundColor: "#FDF2F8",
    borderWidth: 1,
    borderColor: "#FCE7F3",
  },
  interestBtnText: { fontWeight: "600", marginLeft: 8 },
});
