import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { api } from "../../src/services/api";

type MealType = "BREAKFAST" | "LUNCH" | "SNACKS" | "DINNER";

// Matching defaults from backend
const DEFAULT_MESS_RULES = {
  BREAKFAST: { serveTime: "08:00", cutoffHours: 12 },
  LUNCH: { serveTime: "13:00", cutoffHours: 3 },
  SNACKS: { serveTime: "17:00", cutoffHours: 1 },
  DINNER: { serveTime: "20:00", cutoffHours: 4 },
};

interface CreateMenuFormProps {
  onSuccess?: () => void;
}

export function CreateMenuForm({ onSuccess }: CreateMenuFormProps) {
  const [mealType, setMealType] = useState<MealType>("BREAKFAST");

  const [dateObj, setDateObj] = useState(new Date());
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [timeObj, setTimeObj] = useState(new Date());
  const [customServeTime, setCustomServeTime] = useState(
    DEFAULT_MESS_RULES["BREAKFAST"].serveTime,
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Dynamic Array for Menu Items
  const [items, setItems] = useState<string[]>([""]);

  const [customCutoffHours, setCustomCutoffHours] = useState(
    DEFAULT_MESS_RULES["BREAKFAST"].cutoffHours.toString(),
  );

  const [loading, setLoading] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateObj;
    setShowDatePicker(Platform.OS === "ios");
    setDateObj(currentDate);
    setDate(currentDate.toISOString().split("T")[0]);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || timeObj;
    setShowTimePicker(Platform.OS === "ios");
    setTimeObj(currentTime);
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    setCustomServeTime(`${hours}:${minutes}`);
  };

  const handleMealTypeChange = (type: MealType) => {
    setMealType(type);
    setCustomCutoffHours(DEFAULT_MESS_RULES[type].cutoffHours.toString());
    setCustomServeTime(DEFAULT_MESS_RULES[type].serveTime);

    // update timeObj as well
    const [h, m] = DEFAULT_MESS_RULES[type].serveTime.split(":");
    const newTime = new Date();
    newTime.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    setTimeObj(newTime);
  };

  const addItem = () => {
    setItems([...items, ""]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length > 0 ? newItems : [""]);
  };

  const updateItem = (text: string, index: number) => {
    const newItems = [...items];
    newItems[index] = text;
    setItems(newItems);
  };

  const calculatedCutoffTime = useMemo(() => {
    try {
      if (!date || !customServeTime) return "--:--";
      const serveDate = new Date(`${date}T${customServeTime}:00`);
      const cutoffHoursInt = parseInt(customCutoffHours, 10) || 0;
      serveDate.setHours(serveDate.getHours() - cutoffHoursInt);

      return serveDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--:--";
    }
  }, [date, customServeTime, customCutoffHours]);

  const handleSubmit = async () => {
    if (!date) {
      Alert.alert("Missing Date", "Please select a date.");
      return;
    }

    const itemsArray = items.map((i) => i.trim()).filter((i) => i);

    if (itemsArray.length === 0) {
      Alert.alert("Invalid Items", "Please provide at least one menu item.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/smart-mess/create", {
        date,
        mealType,
        items: itemsArray.join(", "),
        customCutoffHours: parseInt(customCutoffHours, 10),
        customServeTime,
      });

      Alert.alert("Success", "Menu created successfully!");
      setItems([""]);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create menu",
      );
    } finally {
      setLoading(false);
    }
  };

  const currentRule = DEFAULT_MESS_RULES[mealType];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Post New Menu</Text>

      {/* Date & Time Row */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* Date Input */}
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: date ? "#1F2937" : "#9CA3AF" }}>
              {date || "Select Date"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateObj}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Time Input */}
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={{ color: customServeTime ? "#1F2937" : "#9CA3AF" }}>
              {customServeTime || "HH:MM"}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={timeObj}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>
      </View>

      {/* Meal Type Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Meal Type</Text>
        <View style={styles.mealTypesContainer}>
          {(["BREAKFAST", "LUNCH", "SNACKS", "DINNER"] as MealType[]).map(
            (type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeBtn,
                  mealType === type && styles.mealTypeBtnActive,
                ]}
                onPress={() => handleMealTypeChange(type)}
              >
                <Text
                  style={[
                    styles.mealTypeText,
                    mealType === type && styles.mealTypeTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>

      {/* Dynamic Items Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Menu Items</Text>

        {items.map((item, index) => (
          <View key={index} style={styles.dynamicRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={item}
              onChangeText={(text) => updateItem(text, index)}
              placeholder={`Item ${index + 1} (e.g. Idli)`}
              placeholderTextColor="#9CA3AF"
            />
            {items.length > 1 && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeItem(index)}
              >
                <Feather name="x" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Feather name="plus" size={20} color="#2563EB" />
          <Text style={styles.addBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Cutoff Hours Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cutoff Hours (Optional Override)</Text>
        <TextInput
          style={styles.input}
          value={customCutoffHours}
          onChangeText={setCustomCutoffHours}
          keyboardType="numeric"
          placeholder={`Default: ${currentRule.cutoffHours}`}
          placeholderTextColor="#9CA3AF"
        />
        <Text style={styles.helpText}>
          Serving Time is{" "}
          {customServeTime > "12"
            ? parseInt(customServeTime) - 12 + " PM"
            : customServeTime + " AM"}
          . Bookings will close at{" "}
          {calculatedCutoffTime > "12"
            ? parseInt(calculatedCutoffTime) - 12 + " PM"
            : calculatedCutoffTime + " AM"}{" "}
          ({customCutoffHours} hours before).
        </Text>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Feather name="plus-circle" size={20} color="white" />
            <Text style={styles.submitBtnText}>Publish Menu</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  helpText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  mealTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mealTypeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  mealTypeBtnActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  mealTypeTextActive: {
    color: "#2563EB",
  },
  dynamicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  removeBtn: {
    padding: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
    gap: 8,
  },
  addBtnText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 10,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
