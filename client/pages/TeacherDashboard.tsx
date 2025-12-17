import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/Card";
import { RecentActivity } from "@/components/RecentActivity";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Calendar,
  Zap,
  Bell,
  Home,
  BookOpen,
  BarChart3,
  User,
  HelpCircle,
  Layers,
  PlusCircle,
  Loader,
} from "lucide-react";
import { firestore } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function TeacherDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.userType !== "teacher") {
      navigate("/teacher-login");
    } else {
      loadStatistics();
    }
  }, [user, navigate]);

  const loadStatistics = async () => {
    if (!user || !user.classes) return;

    setIsLoading(true);
    try {
      setTotalClasses(user.classes.length);

      // Count total students across all classes the teacher teaches
      let studentCount = 0;
      for (const classItem of user.classes) {
        const studentsRef = collection(firestore, "students");
        const q = query(
          studentsRef,
          where("class", "==", classItem.class),
          where("section", "==", classItem.section)
        );
        const snapshot = await getDocs(q);
        studentCount += snapshot.size;
      }
      setTotalStudents(studentCount);
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.userType !== "teacher") return null;

  const actions = [
    {
      id: 1,
      title: "Time Table",
      description: "Create and manage class timetables",
      icon: Calendar,
      link: "/timetable",
    },
    {
      id: 2,
      title: "Create Quiz",
      description: "Create quizzes for your students",
      icon: PlusCircle,
      link: "/create-quiz",
    },
    {
      id: 3,
      title: "Manage Courses",
      description: "Organize your courses and content",
      icon: Layers,
      link: "/courses",
    },
    {
      id: 4,
      title: "Student Performance",
      description: "Track progress and analytics",
      icon: BarChart3,
      link: "/student-performance",
    },
    {
      id: 5,
      title: "Announcements",
      description: "Communicate with students",
      icon: Bell,
      link: "/announcements",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner */}
        <Card variant="gradient" className="p-8 md:p-12 text-white space-y-4">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold">
              {user.school || "Your School"}
              {user.place && `, ${user.place}`}
            </h2>
            <p className="text-lg font-light opacity-90">
              Use Ravya to streamline your teaching and enhance student learning
            </p>
          </div>
        </Card>

        {/* Quick Actions Grid */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Quick Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map((action) => {
              const Icon = action.icon;
              const ActionCard = (
                <Card
                  key={action.id}
                  className="p-6 space-y-4 hover:shadow-lg transition-shadow cursor-pointer group h-full"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold">{action.title}</h4>
                    <p className="text-sm text-muted-foreground font-light">
                      {action.description}
                    </p>
                  </div>
                </Card>
              );

              return action.link ? (
                <Link key={action.id} to={action.link}>
                  {ActionCard}
                </Link>
              ) : (
                ActionCard
              );
            })}
          </div>
        </section>

        {/* Recent Activity */}
        <RecentActivity />

        {/* Statistics */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Statistics</h3>

          {isLoading ? (
            <Card className="p-12">
              <div className="flex items-center justify-center gap-4 text-muted-foreground">
                <Loader className="h-6 w-6 animate-spin" />
                <p className="font-light">Loading statistics...</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-8 text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{totalStudents}</div>
                <p className="text-sm text-muted-foreground font-light">Total Students</p>
              </Card>
              <Card className="p-8 text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{totalClasses}</div>
                <p className="text-sm text-muted-foreground font-light">Classes Taught</p>
              </Card>
              <Card className="p-8 text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{user.classes?.length || 0}</div>
                <p className="text-sm text-muted-foreground font-light">Total Sections</p>
              </Card>
            </div>
          )}
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-around h-20">
          <NavItem icon={Home} label="Home" to="/teacher-dashboard" active />
          <NavItem icon={BookOpen} label="Courses" to="/courses" />
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
      className={`flex flex-col items-center gap-1 px-4 py-2 text-xs font-light transition-colors ${active
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
        }`}
    >
      <Icon className="h-6 w-6" />
      <span>{label}</span>
    </Link>
  );
}
