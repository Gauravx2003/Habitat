export const DEFAULT_MESS_RULES = {
  BREAKFAST: {
    serveTime: "08:00", // 8:00 AM
    cutoffHours: 12, // Book by 8:00 PM previous night
  },
  LUNCH: {
    serveTime: "13:00", // 1:00 PM
    cutoffHours: 3, // Book by 10:00 AM (3 hours before)
  },
  SNACKS: {
    serveTime: "17:00", // 5:00 PM
    cutoffHours: 1, // Book by 4:00 PM
  },
  DINNER: {
    serveTime: "20:00", // 8:00 PM
    cutoffHours: 4, // Book by 4:00 PM
  },
};
