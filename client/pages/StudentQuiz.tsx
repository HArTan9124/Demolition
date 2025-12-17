import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useActivity } from "@/context/ActivityContext";
import { firestore } from "@/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    addDoc,
    Timestamp
} from "firebase/firestore";
import { BookOpen, Loader, Clock, CheckCircle, XCircle, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    class: number;
    section: string;
    createdAt: Timestamp;
}

interface QuizAttempt {
    id: string;
    quizId: string;
    quizTitle: string;
    studentEmail: string;
    isCorrect: boolean;
    timestamp: Timestamp;
}

export default function StudentQuiz() {
    const { user } = useUser();
    const { addActivity } = useActivity();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [myAttempts, setMyAttempts] = useState<QuizAttempt[]>([]);
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        if (!user || user.userType !== "student") {
            navigate("/student-login");
            return;
        }

        loadQuizzes();
        loadMyAttempts();
    }, [user, navigate]);

    const loadQuizzes = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const quizzesRef = collection(firestore, "quizzes");
            const q = query(
                quizzesRef,
                where("class", "==", user.class),
                where("section", "==", user.section),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(q);
            const loadedQuizzes: Quiz[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Quiz));

            setQuizzes(loadedQuizzes);
        } catch (error) {
            console.error("Error loading quizzes:", error);
            toast({
                title: "Error",
                description: "Failed to load quizzes",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadMyAttempts = async () => {
        if (!user) return;

        try {
            const attemptsRef = collection(firestore, "quizAttempts");
            const q = query(
                attemptsRef,
                where("studentEmail", "==", user.email),
                orderBy("timestamp", "desc")
            );

            const snapshot = await getDocs(q);
            const attempts: QuizAttempt[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as QuizAttempt));

            setMyAttempts(attempts);
        } catch (error) {
            console.error("Error loading attempts:", error);
        }
    };

    const handleStartQuiz = (quiz: Quiz) => {
        setActiveQuiz(quiz);
        setSelectedAnswer(null);
        setShowResult(false);
        setIsCorrect(false);
    };

    const handleSubmitQuiz = async () => {
        if (!selectedAnswer || !activeQuiz || !user) {
            toast({
                title: "Error",
                description: "Please select an answer before submitting",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const correct = selectedAnswer === activeQuiz.correctAnswer;
            setIsCorrect(correct);

            // Save quiz attempt to Firestore
            const attemptsRef = collection(firestore, "quizAttempts");
            await addDoc(attemptsRef, {
                quizId: activeQuiz.id,
                quizTitle: activeQuiz.title,
                studentEmail: user.email,
                studentName: user.name,
                studentClass: user.class,
                studentSection: user.section,
                selectedAnswer,
                correctAnswer: activeQuiz.correctAnswer,
                isCorrect: correct,
                timestamp: Timestamp.now(),
            });

            // Add activity
            addActivity({
                type: "quiz_attempt",
                title: `Quiz ${correct ? "Passed" : "Attempted"}`,
                description: `${activeQuiz.title} - ${correct ? "✅ Correct" : "❌ Incorrect"}`,
                metadata: {
                    quizId: activeQuiz.id,
                    isCorrect: correct,
                },
            });

            setShowResult(true);
            loadMyAttempts();

            toast({
                title: correct ? "Correct! 🎉" : "Incorrect",
                description: correct
                    ? "Great job! You got it right!"
                    : `The correct answer was: ${activeQuiz.correctAnswer}`,
                variant: correct ? "default" : "destructive",
            });
        } catch (error) {
            console.error("Error submitting quiz:", error);
            toast({
                title: "Error",
                description: "Failed to submit quiz. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasAttempted = (quizId: string) => {
        return myAttempts.some(attempt => attempt.quizId === quizId);
    };

    const getAttemptResult = (quizId: string) => {
        const attempt = myAttempts.find(a => a.quizId === quizId);
        return attempt?.isCorrect;
    };

    if (!user || user.userType !== "student") return null;

    const correctAttempts = myAttempts.filter(a => a.isCorrect).length;
    const totalAttempts = myAttempts.length;
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BookOpen className="h-8 w-8" />
                        Quizzes
                    </h1>
                    <p className="text-muted-foreground font-light">
                        Test your knowledge and track your progress
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <BookOpen className="h-5 w-5" />
                            <span className="text-sm font-light">Total Quizzes</span>
                        </div>
                        <div className="text-3xl font-bold text-primary">{quizzes.length}</div>
                    </Card>

                    <Card className="p-6 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-sm font-light">Correct Answers</span>
                        </div>
                        <div className="text-3xl font-bold text-green-600">{correctAttempts}</div>
                    </Card>

                    <Card className="p-6 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Trophy className="h-5 w-5" />
                            <span className="text-sm font-light">Accuracy</span>
                        </div>
                        <div className="text-3xl font-bold text-primary">{accuracy.toFixed(0)}%</div>
                    </Card>
                </div>

                {/* Active Quiz */}
                {activeQuiz ? (
                    <Card className="p-8 space-y-6 border-2 border-primary/20 bg-primary/5">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <h2 className="text-2xl font-bold">{activeQuiz.title}</h2>
                                <p className="text-muted-foreground font-light">{activeQuiz.question}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveQuiz(null)}
                            >
                                Close
                            </Button>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            {["A", "B", "C", "D"].map((option) => {
                                const isSelected = selectedAnswer === option;
                                const showCorrect = showResult && option === activeQuiz.correctAnswer;
                                const showIncorrect = showResult && isSelected && option !== activeQuiz.correctAnswer;

                                return (
                                    <div
                                        key={option}
                                        onClick={() => !showResult && setSelectedAnswer(option)}
                                        className={`p-4 rounded-lg border transition-all ${showResult
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
                                            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${showResult
                                                    ? showCorrect
                                                        ? "border-green-500 bg-green-500"
                                                        : showIncorrect
                                                            ? "border-red-500 bg-red-500"
                                                            : "border-border"
                                                    : isSelected
                                                        ? "border-primary bg-primary"
                                                        : "border-border"
                                                }`}>
                                                {isSelected && !showResult && <div className="w-2 h-2 rounded-full bg-white" />}
                                                {showCorrect && <span className="text-white text-xs">✓</span>}
                                                {showIncorrect && <span className="text-white text-xs">✗</span>}
                                            </div>
                                            <p className="font-medium flex-1">
                                                Option {option}: {activeQuiz.options[option as keyof typeof activeQuiz.options]}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Submit/Result */}
                        {!showResult ? (
                            <Button
                                variant="gradient"
                                size="lg"
                                className="w-full"
                                onClick={handleSubmitQuiz}
                                disabled={!selectedAnswer || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Answer"
                                )}
                            </Button>
                        ) : (
                            <div className={`p-4 rounded-lg text-center ${isCorrect ? "bg-green-500/10 border border-green-500" : "bg-red-500/10 border border-red-500"
                                }`}>
                                <p className="font-medium text-lg">
                                    {isCorrect
                                        ? "🎉 Excellent! You got it right!"
                                        : `The correct answer was Option ${activeQuiz.correctAnswer}`}
                                </p>
                            </div>
                        )}
                    </Card>
                ) : (
                    <>
                        {/* Available Quizzes */}
                        {isLoading ? (
                            <Card className="p-12">
                                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                    <Loader className="h-8 w-8 animate-spin" />
                                    <p className="font-light">Loading quizzes...</p>
                                </div>
                            </Card>
                        ) : quizzes.length === 0 ? (
                            <Card className="p-12">
                                <div className="text-center text-muted-foreground">
                                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="font-light">No quizzes available yet</p>
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold">Available Quizzes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {quizzes.map((quiz) => {
                                        const attempted = hasAttempted(quiz.id);
                                        const result = getAttemptResult(quiz.id);

                                        return (
                                            <Card key={quiz.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between">
                                                        <h4 className="text-xl font-semibold">{quiz.title}</h4>
                                                        {attempted && (
                                                            result ? (
                                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5 text-red-600" />
                                                            )
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground font-light line-clamp-2">
                                                        {quiz.question}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(quiz.createdAt.toMillis()).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                <Button
                                                    variant={attempted ? "outline" : "gradient"}
                                                    className="w-full"
                                                    onClick={() => handleStartQuiz(quiz)}
                                                >
                                                    {attempted ? "Retake Quiz" : "Start Quiz"}
                                                </Button>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Quiz History */}
                {myAttempts.length > 0 && !activeQuiz && (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold">Your Quiz History</h3>
                        <Card className="p-6">
                            <div className="space-y-3">
                                {myAttempts.slice(0, 10).map((attempt) => (
                                    <div
                                        key={attempt.id}
                                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{attempt.quizTitle}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(attempt.timestamp.toMillis()).toLocaleString()}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${attempt.isCorrect
                                                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                                    : "bg-red-500/10 text-red-700 dark:text-red-400"
                                                }`}
                                        >
                                            {attempt.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            <div className="h-20" />
        </div>
    );
}
