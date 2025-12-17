import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { LogOut, User, ChevronDown, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  showNav?: boolean;
  variant?: "default" | "minimal";
}

export function Header({ showNav = true, variant = "default" }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const { user, logout } = useUser();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 backdrop-blur-xl bg-background/95 border-b border-border transition-colors duration-200",
      variant === "minimal" && "bg-transparent border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Back Button */}
          <button
            onClick={handleBackClick}
            className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:opacity-75 transition-opacity cursor-pointer"
            title="Go back"
          >
            Ravya
          </button>

          {/* Navigation - Hidden on home page */}
          {showNav && !isHomePage && (
            <nav className="hidden md:flex items-center gap-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1">
                    Login
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link to="/teacher-login">
                    <DropdownMenuItem className="cursor-pointer">
                      Teacher Login
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/student-login">
                    <DropdownMenuItem className="cursor-pointer">
                      Student Login
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          )}

          {/* User Session and Theme Toggle */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button
                  onClick={() => {
                    const dashboardPath = user.userType === "teacher" ? "/teacher-dashboard" : "/student-dashboard";
                    navigate(dashboardPath);
                  }}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                  title="Go to Home"
                >
                  <Home className="h-5 w-5 text-foreground hover:text-primary" />
                </button>
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 animate-fade-in">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate("/");
                    }}
                    className="ml-2 p-1 hover:bg-primary/20 rounded transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4 text-primary" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                title="Go to Login"
              >
                <LogIn className="h-5 w-5 text-foreground hover:text-primary" />
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
