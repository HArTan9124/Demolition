import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/Card";
import { RecentActivity } from "@/components/RecentActivity";
import { TodoFlowchart } from "@/components/TodoFlowchart";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useActivity } from "@/context/ActivityContext";
import { useNavigate, Link } from "react-router-dom";
import { firestore } from "@/firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs, limit, addDoc, Timestamp } from "firebase/firestore";
import { BookOpen, Home, BarChart3, User, Loader } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const PERIODS = Array.from({ length: 8 }, (_, i) => `Period ${i + 1}`);
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TimeSlot {
  subject: string;
  teacher: string;
}

interface Quiz {
  id: string;
  title: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
}

interface Timetable {
  [day: string]: TimeSlot[];
}

export default function StudentDashboard() {
  const { user } = useUser();
  const { addActivity } = useActivity();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [todayQuiz, setTodayQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/student-login");
      return;
    }

    loadTimetableAndQuiz();
  }, [user, navigate]);

  const loadTimetableAndQuiz = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load timetable
      if (user.class && user.section) {
        const timetableRef = doc(
          firestore,
          "timetables",
          `class_${user.class}_section_${user.section}`
        );
        const timetableSnap = await getDoc(timetableRef);

        if (timetableSnap.exists()) {
          const data = timetableSnap.data();
          const loadedTimetable: Timetable = {};
          DAYS.forEach((day) => {
            loadedTimetable[day] = data[day] || [];
          });
          setTimetable(loadedTimetable);
        }

        // Load today's quiz (latest quiz for the student's class and section)
        const quizzesRef = collection(firestore, "quizzes");
        const q = query(
          quizzesRef,
          where("class", "==", user.class),
          where("section", "==", user.section),
          orderBy("createdAt", "desc"),
          limit(1)
        );

        const quizSnapshot = await getDocs(q);
        if (!quizSnapshot.empty) {
          const quizDoc = quizSnapshot.docs[0];
          setTodayQuiz({
            id: quizDoc.id,
            ...quizDoc.data(),
          } as Quiz);
        }
      }
    } catch (error) {
      console.error("Error loading timetable and quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!selectedAnswer || !todayQuiz || !user) {
      toast({
        title: "Error",
        description: "Please select an answer before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingQuiz(true);
    try {
      const isCorrect = selectedAnswer === todayQuiz.correctAnswer;

      // Save quiz attempt to Firestore
      const attemptsRef = collection(firestore, "quizAttempts");
      await addDoc(attemptsRef, {
        quizId: todayQuiz.id,
        quizTitle: todayQuiz.title,
        studentEmail: user.email,
        studentName: user.name,
        studentClass: user.class,
        studentSection: user.section,
        selectedAnswer,
        correctAnswer: todayQuiz.correctAnswer,
        isCorrect,
        timestamp: Timestamp.now(),
      });

      // Add activity
      addActivity({
        type: "quiz_attempt",
        title: `Quiz ${isCorrect ? "Passed" : "Attempted"}`,
        description: `${todayQuiz.title} - ${isCorrect ? "✅ Correct" : "❌ Incorrect"}`,
        metadata: {
          quizId: todayQuiz.id,
          isCorrect,
        },
      });

      setQuizSubmitted(true);

      toast({
        title: isCorrect ? "Correct! 🎉" : "Incorrect",
        description: isCorrect
          ? "Great job! You got it right!"
          : `The correct answer was: ${todayQuiz.correctAnswer}`,
        variant: isCorrect ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingQuiz(false);
    }
  };


  if (!user) return null;

  const courses = [
    { id: 1, name: "Mathematics", icon: "📐", lessons: 12 },
    { id: 2, name: "Science", icon: "🔬", lessons: 15 },
    { id: 3, name: "English", icon: "📚", lessons: 8 },
    { id: 4, name: "Social Science", icon: "🌍", lessons: 10 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Featured Course Banner */}
        <Card variant="gradient" className="p-8 md:p-12 text-white space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-light opacity-90">
              {user.school && user.place ? `${user.school}, ${user.place}` : user.school || "Your School"}
            </p>
            <p className="text-sm font-light opacity-90">Class {user.class} - Section {user.section}</p>
            <h2 className="text-3xl md:text-4xl font-bold">Welcome back, {user.name}!</h2>
          </div>
          <div className="h-0.5 bg-white/30 w-full" />
          <p className="text-sm font-light opacity-90">
            Check your timetable and today's quiz below
          </p>
        </Card>

        {/* My Courses Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">My Courses</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="p-8 flex flex-col items-center gap-4 text-center hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="text-5xl">{course.icon}</div>
                <div>
                  <h4 className="text-xl font-semibold">{course.name}</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    {course.lessons} Lessons
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Today's Quiz */}
        {isLoading ? (
          <section className="space-y-4">
            <h3 className="text-2xl font-bold">Today's Quiz</h3>
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader className="h-8 w-8 animate-spin" />
                <p className="font-light">Loading today's quiz...</p>
              </div>
            </Card>
          </section>
        ) : todayQuiz ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Today's Quiz</h3>
              <Link to="/student-quiz">
                <Button variant="outline" size="sm">
                  View All Quizzes
                </Button>
              </Link>
            </div>

            <Card className="p-8 space-y-6 border-2 border-primary/20 bg-primary/5">
              <div className="space-y-2">
                <h4 className="text-xl font-semibold">{todayQuiz.title}</h4>
                <p className="text-muted-foreground font-light">{todayQuiz.question}</p>
              </div>

              <div className="space-y-3">
                {["A", "B", "C", "D"].map((option) => {
                  const isSelected = selectedAnswer === option;
                  const showCorrect = quizSubmitted && option === todayQuiz.correctAnswer;
                  const showIncorrect = quizSubmitted && isSelected && option !== todayQuiz.correctAnswer;

                  return (
                    <div
                      key={option}
                      onClick={() => !quizSubmitted && setSelectedAnswer(option)}
                      className={`p-4 rounded-lg border transition-all ${quizSubmitted
                        ? showCorrect
                          ? "border-green-500 bg-green-500/10"
                          : showIncorrect
                            ? "border-red-500 bg-red-500/10"
                            : "border-border"
                        : isSelected
                          ? "border-primary bg-primary/10 cursor-pointer"
                          : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${quizSubmitted
                          ? showCorrect
                            ? "border-green-500 bg-green-500"
                            : showIncorrect
                              ? "border-red-500 bg-red-500"
                              : "border-border"
                          : isSelected
                            ? "border-primary bg-primary"
                            : "border-border"
                          }`}>
                          {isSelected && !quizSubmitted && <div className="w-2 h-2 rounded-full bg-white" />}
                          {showCorrect && <span className="text-white text-xs">✓</span>}
                          {showIncorrect && <span className="text-white text-xs">✗</span>}
                        </div>
                        <p className="font-medium flex-1">
                          Option {option}: {todayQuiz.options[option as keyof typeof todayQuiz.options]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={handleQuizSubmit}
                  disabled={!selectedAnswer || isSubmittingQuiz}
                >
                  {isSubmittingQuiz ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Answer"
                  )}
                </Button>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="font-medium">
                    {selectedAnswer === todayQuiz.correctAnswer
                      ? "🎉 Excellent! You got it right!"
                      : `The correct answer was Option ${todayQuiz.correctAnswer}`}
                  </p>
                </div>
              )}
            </Card>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Quizzes</h3>
              <Link to="/student-quiz">
                <Button variant="outline" size="sm">
                  View All Quizzes
                </Button>
              </Link>
            </div>

            <Card className="p-8 text-center space-y-4 bg-muted/20 border-dashed">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <div className="space-y-2">
                <h4 className="text-xl font-semibold">No Quiz for Today</h4>
                <p className="text-muted-foreground font-light">
                  Catch up on previous quizzes or practice your knowledge
                </p>
              </div>
              <Link to="/student-quiz">
                <Button variant="gradient">
                  Go to Quizzes
                </Button>
              </Link>
            </Card>
          </section>
        )}

        {/* Timetable Section */}
        {timetable && (
          <section className="space-y-4">
            <h3 className="text-2xl font-bold">Time Table</h3>

            <Card className="p-6 overflow-x-auto">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border px-3 py-2 text-left font-semibold">
                        Period
                      </th>
                      {DAYS.map((day) => (
                        <th
                          key={day}
                          className="border border-border px-3 py-2 text-left font-semibold"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map((period, periodIndex) => (
                      <tr key={period} className="hover:bg-muted/30">
                        <td className="border border-border px-3 py-2 font-medium bg-muted/20">
                          {period}
                        </td>
                        {DAYS.map((day) => {
                          const slot = timetable[day]?.[periodIndex];
                          return (
                            <td
                              key={`${day}-${periodIndex}`}
                              className="border border-border px-3 py-2"
                            >
                              <div className="space-y-1">
                                <p className="font-medium text-sm">{slot?.subject || "-"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {slot?.teacher || ""}
                                </p>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        )}

        {/* Recent Activity */}
        <RecentActivity />

        {/* Daily Schedule Planner */}
        <section className="space-y-4">
          <TodoFlowchart />
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-around h-20">
          <NavItem icon={Home} label="Home" to="/student-dashboard" active />
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
