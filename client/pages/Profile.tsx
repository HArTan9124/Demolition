import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { LogOut, User, Mail, BookOpen, Home, Layers, BarChart3 } from "lucide-react";

export default function Profile() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate(user?.userType === "teacher" ? "/teacher-login" : "/student-login");
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate(user.userType === "teacher" ? "/teacher-login" : "/student-login");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader showProfileIcon={false} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Card */}
        <Card className="p-8 space-y-6">
          <div className="flex items-start gap-6">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-primary text-white">
              <User className="h-10 w-10" />
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground font-light capitalize">
                {user.userType} Account
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-border">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>

            {user.email && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email / ID
                </label>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Account Type
              </label>
              <p className="text-lg font-semibold capitalize">{user.userType}</p>
            </div>
          </div>
        </Card>

        {/* Settings Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Settings</h2>

          <Card className="p-6 space-y-3">
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors">
              <span className="font-medium">Edit Profile</span>
              <span className="text-muted-foreground">→</span>
            </button>
            <div className="border-t border-border" />
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors">
              <span className="font-medium">Change Password</span>
              <span className="text-muted-foreground">→</span>
            </button>
            <div className="border-t border-border" />
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors">
              <span className="font-medium">Notifications</span>
              <span className="text-muted-foreground">→</span>
            </button>
          </Card>
        </section>

        {/* Logout */}
        <div className="space-y-4">
          <Button
            onClick={handleLogout}
            variant="destructive"
            size="lg"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
          <p className="text-xs text-muted-foreground font-light text-center">
            You will be logged out and redirected to the login page.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-around h-20">
          <NavItem
            icon={Home}
            label="Home"
            to={user.userType === "teacher" ? "/teacher-dashboard" : "/student-dashboard"}
          />
          <NavItem icon={BookOpen} label="Courses" to="/courses" />
          <NavItem icon={BarChart3} label="Progress" to="/progress" />
          <NavItem icon={User} label="Profile" to="/profile" active />
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
