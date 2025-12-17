import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { Mail, Lock, Eye, EyeOff, Loader, User, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TeacherSignup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    school: "",
    place: "",
    password: "",
    confirmPassword: "",
    classes: [] as { class: number; section: string }[],
  });
  const [newClass, setNewClass] = useState({ class: 1, section: "A" });
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddClass = () => {
    if (formData.classes.some(c => c.class === newClass.class && c.section === newClass.section)) {
      toast({
        title: "Already Added",
        description: "This class and section combination is already in your list",
        variant: "destructive",
      });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      classes: [...prev.classes, { ...newClass }],
    }));
    toast({
      title: "Class Added",
      description: `Class ${newClass.class}-${newClass.section} added successfully`,
    });
  };

  const handleRemoveClass = (classItem: { class: number; section: string }) => {
    setFormData((prev) => ({
      ...prev,
      classes: prev.classes.filter(c => !(c.class === classItem.class && c.section === classItem.section)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.school || !formData.password || !formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validate classes
      if (formData.classes.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one class you will teach",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      await signup(formData, "teacher");
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      navigate("/teacher-dashboard");
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "Failed to create account",
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
                – Teacher Sign Up
              </h1>
              <p className="text-muted-foreground font-light">
                Create your account to empower your class
              </p>
            </div>

            {/* Signup Card */}
            <Card className="p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@school.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* School Field */}
                <div className="space-y-2">
                  <label htmlFor="school" className="block text-sm font-medium">
                    School / Institution
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="school"
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      placeholder="Central High School"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Place Field */}
                <div className="space-y-2">
                  <label htmlFor="place" className="block text-sm font-medium">
                    School Location / City
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="place"
                      type="text"
                      name="place"
                      value={formData.place}
                      onChange={handleChange}
                      placeholder="New York, NY"
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

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Classes Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    Classes You Will Teach *
                  </label>

                  {/* Add Class Interface */}
                  <div className="flex gap-2">
                    <select
                      value={newClass.class}
                      onChange={(e) => setNewClass({ ...newClass, class: parseInt(e.target.value) })}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>Class {num}</option>
                      ))}
                    </select>
                    <select
                      value={newClass.section}
                      onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      {["A", "B", "C", "D", "E", "F"].map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      onClick={handleAddClass}
                      variant="outline"
                      size="sm"
                      className="px-4"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Display Selected Classes */}
                  {formData.classes.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                      {formData.classes.map((classItem, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          <span>Class {classItem.class}-{classItem.section}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveClass(classItem)}
                            className="hover:text-destructive transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.classes.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add at least one class to continue
                    </p>
                  )}
                </div>


                {/* Signup Button */}
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
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Card>

            {/* Footer Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground font-light">
                Already have an account?{" "}
                <Link
                  to="/teacher-login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
