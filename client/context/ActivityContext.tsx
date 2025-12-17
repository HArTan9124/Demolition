import React, { createContext, useContext, useState, useCallback } from "react";

export interface Activity {
  id: string;
  type: "login" | "timetable_update" | "quiz_create" | "quiz_update" | "material_upload" | "announcement" | "quiz_attempt";
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
  clearActivities: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem("ravya_activities");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return parsed.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp),
        }));
      } catch (error) {
        console.error("Error parsing activities from localStorage:", error);
        return [];
      }
    }
    return [];
  });

  const addActivity = useCallback((activity: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = {
      ...activity,
      id: `activity_${Date.now()}`,
      timestamp: new Date(),
    };

    setActivities((prev) => {
      const updated = [newActivity, ...prev].slice(0, 50);
      // Save to localStorage with proper serialization
      localStorage.setItem("ravya_activities", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
    localStorage.removeItem("ravya_activities");
  }, []);

  return (
    <ActivityContext.Provider value={{ activities, addActivity, clearActivities }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}
