import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useActivity } from "@/context/ActivityContext";
import { useNavigate, Link } from "react-router-dom";
import { firestore } from "@/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Home, BookOpen, BarChart3, User, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ["A", "B", "C", "D"];

export default function CreateQuiz() {
  const { user } = useUser();
  const { addActivity } = useActivity();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    class: 1,
    section: "A",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A" as "A" | "B" | "C" | "D",
  });

  if (!user || user.userType !== "teacher") {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "class" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.title || !formData.question || !formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const quizzesRef = collection(firestore, "quizzes");
      await addDoc(quizzesRef, {
        title: formData.title,
        class: formData.class,
        section: formData.section,
        question: formData.question,
        options: {
          A: formData.optionA,
          B: formData.optionB,
          C: formData.optionC,
          D: formData.optionD,
        },
        correctAnswer: formData.correctAnswer,
        createdBy: user.email,
        createdAt: Timestamp.now(),
      });

      addActivity({
        type: "quiz_create",
        title: "Quiz Created",
        description: `${formData.title} - Class ${formData.class}-${formData.section}`,
        metadata: {
          title: formData.title,
          class: formData.class,
          section: formData.section,
        },
      });

      toast({
        title: "Success",
        description: "Quiz created successfully!",
      });

      // Reset form
      setFormData({
        title: "",
        class: 1,
        section: "A",
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Create Quiz</h1>
          <p className="text-muted-foreground font-light">
            Create a new quiz for your students
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium">
                Quiz Title
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Chapter 3 Quiz"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            {/* Class and Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="class" className="block text-sm font-medium">
                  Class
                </label>
                <select
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  {CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="section" className="block text-sm font-medium">
                  Section
                </label>
                <select
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  {SECTIONS.map((section) => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question */}
            <div className="space-y-2">
              <label htmlFor="question" className="block text-sm font-medium">
                Question
              </label>
              <textarea
                id="question"
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="Enter the question"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                required
              />
            </div>

            {/* Options */}
            <div className="space-y-4">
              <h3 className="font-semibold">Answer Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="optionA" className="block text-sm font-medium">
                    Option A
                  </label>
                  <input
                    id="optionA"
                    type="text"
                    name="optionA"
                    value={formData.optionA}
                    onChange={handleChange}
                    placeholder="Enter option A"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="optionB" className="block text-sm font-medium">
                    Option B
                  </label>
                  <input
                    id="optionB"
                    type="text"
                    name="optionB"
                    value={formData.optionB}
                    onChange={handleChange}
                    placeholder="Enter option B"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="optionC" className="block text-sm font-medium">
                    Option C
                  </label>
                  <input
                    id="optionC"
                    type="text"
                    name="optionC"
                    value={formData.optionC}
                    onChange={handleChange}
                    placeholder="Enter option C"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="optionD" className="block text-sm font-medium">
                    Option D
                  </label>
                  <input
                    id="optionD"
                    type="text"
                    name="optionD"
                    value={formData.optionD}
                    onChange={handleChange}
                    placeholder="Enter option D"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Correct Answer */}
            <div className="space-y-2">
              <label htmlFor="correctAnswer" className="block text-sm font-medium">
                Correct Answer
              </label>
              <select
                id="correctAnswer"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Quiz"
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-primary/5 border border-primary/20">
          <h3 className="font-semibold mb-2">📌 Quiz Information</h3>
          <ul className="text-sm text-muted-foreground font-light space-y-1">
            <li>• Enter a title for your quiz</li>
            <li>• Select the class and section this quiz is for</li>
            <li>• Write the question and all four answer options</li>
            <li>• Select the correct answer</li>
            <li>• Click "Save Quiz" to publish it</li>
            <li>• Students in the selected class and section will see this quiz in their dashboard</li>
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
