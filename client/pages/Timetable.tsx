import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useActivity } from "@/context/ActivityContext";
import { useNavigate, Link } from "react-router-dom";
import { firestore } from "@/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { Home, BookOpen, BarChart3, User, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ["A", "B", "C", "D"];

// Time slots - 40 mins each with lunch breaks alternating
const getTimeSlots = (dayIndex: number) => {
  const baseSlots = [
    { time: "8:00 - 8:40", label: "Period 1" },
    { time: "8:40 - 9:20", label: "Period 2" },
    { time: "9:20 - 10:00", label: "Period 3" },
    { time: "10:00 - 10:40", label: "Period 4" },
  ];

  // Alternate lunch break placement
  if (dayIndex % 2 === 0) {
    // Even days (Monday, Wednesday, Friday): Lunch after Period 4
    return [
      ...baseSlots,
      { time: "10:40 - 11:40", label: "Lunch Break", isLunch: true },
      { time: "11:40 - 12:20", label: "Period 5" },
      { time: "12:20 - 1:00", label: "Period 6" },
    ];
  } else {
    // Odd days (Tuesday, Thursday, Saturday): Lunch after Period 3
    return [
      ...baseSlots.slice(0, 3),
      { time: "9:20 - 10:20", label: "Lunch Break", isLunch: true },
      { time: "10:20 - 11:00", label: "Period 4" },
      { time: "11:00 - 11:40", label: "Period 5" },
      { time: "11:40 - 12:20", label: "Period 6" },
    ];
  }
};

const PERIODS = getTimeSlots(0);

interface TimeSlot {
  subject: string;
}

interface TimetableData {
  [day: string]: TimeSlot[];
}

export default function Timetable() {
  const { user } = useUser();
  const { addActivity } = useActivity();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>("A");
  const [timetable, setTimetable] = useState<TimetableData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user || user.userType !== "teacher") {
      navigate("/teacher-login");
    }
  }, [user, navigate]);

  // Initialize empty timetable
  useEffect(() => {
    const newTimetable: TimetableData = {};
    DAYS.forEach((day, dayIndex) => {
      const daySlots = getTimeSlots(dayIndex);
      newTimetable[day] = Array(daySlots.length).fill(null).map(() => ({
        subject: "",
      }));
    });
    setTimetable(newTimetable);
  }, []);

  // Load timetable when class or section changes
  const handleLoadTimetable = async () => {
    setIsLoading(true);
    try {
      const teacherId = user?.id;
      if (!teacherId) {
        toast({
          title: "Error",
          description: "Teacher ID not found",
          variant: "destructive",
        });
        return;
      }

      const className = `${selectedClass}-${selectedSection}`;
      const docRef = doc(firestore, "class_timetables", teacherId, "classes", className);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const loadedTimetable: TimetableData = {};
        DAYS.forEach((day, dayIndex) => {
          const daySlots = getTimeSlots(dayIndex);
          loadedTimetable[day] = data[day] || Array(daySlots.length).fill(null).map(() => ({
            subject: "",
          }));
        });
        setTimetable(loadedTimetable);
        toast({
          title: "Success",
          description: `Timetable for Class ${selectedClass}-${selectedSection} loaded`,
        });
      } else {
        // Create empty timetable
        const newTimetable: TimetableData = {};
        DAYS.forEach((day, dayIndex) => {
          const daySlots = getTimeSlots(dayIndex);
          newTimetable[day] = Array(daySlots.length).fill(null).map(() => ({
            subject: "",
          }));
        });
        setTimetable(newTimetable);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load timetable",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTimetable = async () => {
    setIsSaving(true);
    try {
      const teacherId = user?.id;
      console.log("Saving timetable - Teacher ID:", teacherId);
      console.log("User object:", user);

      if (!teacherId) {
        toast({
          title: "Error",
          description: "Teacher ID not found - Please log in again",
          variant: "destructive",
        });
        console.error("Teacher ID is missing");
        return;
      }

      const className = `${selectedClass}-${selectedSection}`;
      console.log("Saving to path:", `class_timetables/${teacherId}/classes/${className}`);
      console.log("Timetable data:", timetable);

      const docRef = doc(firestore, "class_timetables", teacherId, "classes", className);
      await setDoc(docRef, {
        class: selectedClass,
        section: selectedSection,
        ...timetable,
        updatedAt: Timestamp.now(),
      });

      console.log("Timetable saved successfully");

      addActivity({
        type: "timetable_update",
        title: "Timetable Updated",
        description: `Class ${selectedClass}-${selectedSection} timetable updated`,
        metadata: {
          class: selectedClass,
          section: selectedSection,
        },
      });

      toast({
        title: "Success",
        description: `Timetable for Class ${selectedClass}-${selectedSection} saved`,
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save timetable",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCellChange = (day: string, periodIndex: number, field: "subject", value: string) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: prev[day].map((slot, idx) =>
        idx === periodIndex
          ? { ...slot, [field]: value }
          : slot
      ),
    }));
  };

  if (!user || user.userType !== "teacher") return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Time Table</h1>
          <p className="text-muted-foreground font-light">
            Create and manage class timetables
          </p>
        </div>

        {/* Selection Cards */}
        <Card className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Class Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Select Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {SECTIONS.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
            </div>

            {/* Load Button */}
            <Button
              onClick={handleLoadTimetable}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load Time Table"
              )}
            </Button>
          </div>
        </Card>

        {/* Timetable Grid */}
        <Card className="p-6 overflow-x-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Class {selectedClass} - Section {selectedSection}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-2 text-left font-semibold text-sm">
                      Period
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="border border-border px-4 py-2 text-left font-semibold text-sm"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map((period, periodIndex) => (
                    <tr key={period.label} className="hover:bg-muted/30">
                      <td className="border border-border px-4 py-3 font-medium bg-muted/20 whitespace-nowrap">
                        <div className="text-xs font-semibold">{period.label}</div>
                        <div className="text-xs text-muted-foreground">{period.time}</div>
                      </td>
                      {DAYS.map((day, dayIndex) => {
                        const daySlots = getTimeSlots(dayIndex);
                        const currentPeriod = daySlots[periodIndex];
                        const isLunch = currentPeriod?.isLunch || false;
                        const slot = timetable[day]?.[periodIndex];

                        return (
                          <td
                            key={`${day}-${periodIndex}`}
                            className={`border border-border px-2 py-2 ${
                              isLunch ? "bg-muted/50" : ""
                            }`}
                          >
                            {isLunch ? (
                              <div className="flex items-center justify-center h-12 text-xs font-semibold text-muted-foreground">
                                Lunch Break
                              </div>
                            ) : (
                              <input
                                type="text"
                                placeholder="Subject"
                                value={slot?.subject || ""}
                                onChange={(e) =>
                                  handleCellChange(day, periodIndex, "subject", e.target.value)
                                }
                                className="w-full px-2 py-1 text-xs rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary/20"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveTimetable}
                variant="gradient"
                size="lg"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Time Table"
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-primary/5 border border-primary/20">
          <h3 className="font-semibold mb-2">📌 How to use</h3>
          <ul className="text-sm text-muted-foreground font-light space-y-1">
            <li>• Select the Class and Section you want to create a timetable for</li>
            <li>• Click "Load Time Table" to load an existing timetable or start fresh</li>
            <li>• Each class period is 40 minutes long</li>
            <li>• Lunch breaks alternate between even and odd days</li>
            <li>• Enter the subject name for each class period (lunch breaks are automatic)</li>
            <li>• Click "Save Time Table" to save your changes</li>
            <li>• Students will see this timetable in their dashboard</li>
          </ul>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-around h-20">
          <NavItem icon={Home} label="Home" to="/teacher-dashboard" />
          <NavItem icon={BookOpen} label="Courses" to="/courses" active />
          <NavItem icon={BarChart3} label="Progress" to="/progress" />
          <NavItem icon={User} label="Profile" to="/profile" />
        </div>
      </nav>

      {/* Padding for fixed nav */}
      <div className="h-20" />
    </div>
  );
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
  active?: boolean;
}

function NavItem({ icon: Icon, label, to, active = false }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 px-4 py-2 text-xs font-light transition-colors ${
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-6 w-6" />
      <span>{label}</span>
    </Link>
  );
}
