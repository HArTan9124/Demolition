import { Link } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { ThemeToggle } from "./ThemeToggle";
import { User } from "lucide-react";

interface DashboardHeaderProps {
  showProfileIcon?: boolean;
}

export function DashboardHeader({ showProfileIcon = true }: DashboardHeaderProps) {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-background/95 border-b border-border backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Ravya
          </div>

          {/* Center - Can be used for navigation */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {/* Navigation items can be added here */}
          </div>

          {/* Right side - Welcome message and profile */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-muted-foreground font-light">Welcome back,</p>
              <p className="text-sm font-semibold text-foreground">{user?.name || "User"}</p>
            </div>

            {showProfileIcon && (
              <Link
                to="/profile"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
