import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useActivity } from "@/context/ActivityContext";
import { Mail, Lock, Eye, EyeOff, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TeacherLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();
  const { addActivity } = useActivity();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("teacher_remember_me");
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password, "teacher");

      if (formData.rememberMe) {
        localStorage.setItem("teacher_remember_me", formData.email);
      } else {
        localStorage.removeItem("teacher_remember_me");
      }

      addActivity({
        type: "login",
        title: "Logged in",
        description: `Teacher account login - ${formData.email}`,
      });

      toast({
        title: "Success",
        description: "Login successful!",
      });
      navigate("/teacher-dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showNav={false} />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 opacity-50 pointer-events-none" />

          <div className="relative space-y-8">
            {/* Header */}
            <div className="space-y-3 text-center">
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Ravya
                </span>{" "}
                – Teacher Login
              </h1>
              <p className="text-muted-foreground font-light">
                Empower your class with smart tools
              </p>
            </div>

            {/* Login Card */}
            <Card className="p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="email"
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="teacher@ravya.edu"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border border-input"
                  />
                  <label htmlFor="rememberMe" className="text-sm font-light cursor-pointer">
                    Remember me
                  </label>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-card text-muted-foreground font-light">
                    or
                  </span>
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground font-light text-center">
                  <Link
                    to="#"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </p>
              </div>
            </Card>

            {/* Footer Links */}
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground font-light">
                Don't have an account?{" "}
                <Link
                  to="/teacher-signup"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Create one
                </Link>
              </p>
              <p className="text-sm text-muted-foreground font-light">
                Not a teacher?{" "}
                <Link
                  to="/student-login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Go to Student Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
