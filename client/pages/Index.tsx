import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Index() {
  const features = [
    {
      icon: BookOpen,
      title: "Smart Learning",
      description: "Interactive courses with AI-powered insights and personalized learning paths",
    },
    {
      icon: Users,
      title: "Collaborative Tools",
      description: "Connect with teachers and classmates in a supportive learning environment",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Visualize your academic journey with detailed analytics and performance metrics",
    },
    {
      icon: Calendar,
      title: "Schedule Management",
      description: "Organized timetables and class schedules at your fingertips",
    },
  ];

  const courses = [
    {
      id: 1,
      name: "Social Science",
      description: "Explore history, geography, and civics concepts",
      icon: "🌍",
    },
    {
      id: 2,
      name: "Maths",
      description: "Master numbers, algebra, geometry, and problem-solving",
      icon: "📐",
    },
    {
      id: 3,
      name: "English",
      description: "Develop language skills and literary understanding",
      icon: "📚",
    },
    {
      id: 4,
      name: "Science",
      description: "Discover physics, chemistry, and biology fundamentals",
      icon: "🔬",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Auth Section */}
      <section className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Get Started with Ravya</h2>
              <p className="text-muted-foreground font-light">Create your account or login to access learning tools</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link to="/teacher-signup" className="flex-1 md:flex-none">
                <Button variant="outline" size="lg" className="w-full">
                  Create Teacher Account
                </Button>
              </Link>
              <Link to="/student-signup" className="flex-1 md:flex-none">
                <Button variant="outline" size="lg" className="w-full">
                  Create Student Account
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="gradient" size="lg" className="w-full inline-flex items-center gap-2">
                    Login
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
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
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Welcome to{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Ravya
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light">
                The modern learning management system designed for teachers and students who
                demand more from their educational technology
              </p>
            </div>

            {/* Decorative Cards Grid */}
            <div className="mt-20 md:mt-32 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-8 text-center space-y-4 animate-slide-up hover:shadow-lg transition-all transform hover:scale-105">
                <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-count">
                  10K+
                </div>
                <p className="text-muted-foreground font-light">Students Learning</p>
              </Card>
              <Card className="p-8 text-center space-y-4 animate-slide-up hover:shadow-lg transition-all transform hover:scale-105" style={{ animationDelay: '100ms' }}>
                <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-count" style={{ animationDelay: '100ms' }}>
                  500+
                </div>
                <p className="text-muted-foreground font-light">Expert Teachers</p>
              </Card>
              <Card className="p-8 text-center space-y-4 animate-slide-up hover:shadow-lg transition-all transform hover:scale-105" style={{ animationDelay: '200ms' }}>
                <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-count" style={{ animationDelay: '200ms' }}>
                  100+
                </div>
                <p className="text-muted-foreground font-light">Courses Available</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 md:py-32 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Our Courses</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Our Subjects
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-light">
              Quality education across core subjects designed for student success
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {courses.map((course, index) => (
              <Card key={course.id} className="p-8 hover:shadow-lg transition-all transform hover:scale-105 animate-slide-up cursor-pointer" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="space-y-4">
                  <div className="text-5xl">{course.icon}</div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{course.name}</h3>
                    <p className="text-muted-foreground font-light">
                      {course.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-light">
              Comprehensive tools designed to enhance learning and teaching
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-8 hover:shadow-lg transition-all transform hover:scale-105 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-primary text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground font-light">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="gradient" className="p-12 md:p-16 text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to transform your learning experience?
            </h2>
            <p className="text-lg opacity-90 font-light max-w-2xl mx-auto">
              Join thousands of students and teachers already using Ravya to achieve their academic goals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/teacher-login">
                <Button className="w-full sm:w-auto bg-white text-primary hover:bg-white/90" size="lg">
                  Teacher Login
                </Button>
              </Link>
              <Link to="/student-login">
                <Button className="w-full sm:w-auto bg-white text-primary hover:bg-white/90" size="lg">
                  Student Login
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Ravya
              </p>
              <p className="text-sm text-muted-foreground font-light mt-1">
                Modern learning for modern minds
              </p>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground font-light">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground font-light">
            <p>&copy; 2024 Ravya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
