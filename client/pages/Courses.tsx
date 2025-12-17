import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Microscope, Languages, Globe, ArrowRight } from "lucide-react";

const COURSES = [
  {
    id: 1,
    title: "Social Science",
    description: "Explore history, geography, and civics concepts",
    icon: "🌍",
    students: "2,450",
  },
  {
    id: 2,
    title: "Maths",
    description: "Master numbers, algebra, geometry, and problem-solving",
    icon: "📐",
    students: "3,120",
  },
  {
    id: 3,
    title: "English",
    description: "Develop language skills and literary understanding",
    icon: "📚",
    students: "2,890",
  },
  {
    id: 4,
    title: "Science",
    description: "Discover physics, chemistry, and biology fundamentals",
    icon: "🔬",
    students: "1,980",
  },
];

export default function Courses() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Our Courses
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your subject and start learning with interactive content, expert guidance, and comprehensive resources
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COURSES.map((course, index) => {
            return (
              <div
                key={course.id}
                className="group animate-slide-up"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <Card className="p-8 space-y-4 h-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center">
                  {/* Icon */}
                  <div className="text-5xl">
                    {course.icon}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-light">
                      {course.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground animate-count">
                        {course.students}
                      </span>{" "}
                      active students
                    </p>
                  </div>

                  {/* Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full group/btn justify-between hover:bg-primary/10"
                  >
                    Explore Course
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <Card className="p-8 md:p-12 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 space-y-6 text-center animate-fade-in">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to get started?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of students and teachers using Ravya to enhance their learning experience
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/student-signup">
              <Button variant="gradient" size="lg">
                Enroll as Student
              </Button>
            </Link>
            <Link to="/teacher-signup">
              <Button variant="outline" size="lg">
                Teach a Course
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
