import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/Card";
import { useUser } from "@/context/UserContext";
import { firestore } from "@/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { BarChart3, Users, TrendingUp, Award, Loader } from "lucide-react";

interface QuizAttempt {
    id: string;
    quizId: string;
    quizTitle: string;
    studentEmail: string;
    studentName: string;
    studentClass: number;
    studentSection: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timestamp: Timestamp;
}

interface StudentPerformanceData {
    studentName: string;
    studentEmail: string;
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
}

export default function StudentPerformance() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
    const [performanceData, setPerformanceData] = useState<StudentPerformanceData[]>([]);
    const [selectedClass, setSelectedClass] = useState<{ class: number; section: string } | null>(null);
    const [totalStudents, setTotalStudents] = useState(0);

    useEffect(() => {
        if (!user || user.userType !== "teacher") {
            navigate("/teacher-login");
            return;
        }

        // Set default selected class to the first class the teacher teaches
        if (user.classes && user.classes.length > 0 && !selectedClass) {
            setSelectedClass(user.classes[0]);
        }
    }, [user, navigate, selectedClass]);

    useEffect(() => {
        if (selectedClass) {
            loadPerformanceData();
        }
    }, [selectedClass]);

    const loadPerformanceData = async () => {
        if (!selectedClass) return;

        setIsLoading(true);
        try {
            // Fetch all quiz attempts for the selected class
            const attemptsRef = collection(firestore, "quizAttempts");
            const q = query(
                attemptsRef,
                where("studentClass", "==", selectedClass.class),
                where("studentSection", "==", selectedClass.section)
            );

            const snapshot = await getDocs(q);
            const attempts: QuizAttempt[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as QuizAttempt));

            setQuizAttempts(attempts);

            // Calculate performance by student
            const studentMap = new Map<string, StudentPerformanceData>();

            attempts.forEach(attempt => {
                const key = attempt.studentEmail;
                if (!studentMap.has(key)) {
                    studentMap.set(key, {
                        studentName: attempt.studentName,
                        studentEmail: attempt.studentEmail,
                        totalAttempts: 0,
                        correctAttempts: 0,
                        accuracy: 0,
                    });
                }

                const data = studentMap.get(key)!;
                data.totalAttempts++;
                if (attempt.isCorrect) {
                    data.correctAttempts++;
                }
                data.accuracy = (data.correctAttempts / data.totalAttempts) * 100;
            });

            const performance = Array.from(studentMap.values())
                .sort((a, b) => b.accuracy - a.accuracy);

            setPerformanceData(performance);

            // Get total students count for this class
            const studentsRef = collection(firestore, "students");
            const studentsQuery = query(
                studentsRef,
                where("class", "==", selectedClass.class),
                where("section", "==", selectedClass.section)
            );
            const studentsSnapshot = await getDocs(studentsQuery);
            setTotalStudents(studentsSnapshot.size);

        } catch (error) {
            console.error("Error loading performance data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || user.userType !== "teacher") return null;

    const averageAccuracy = performanceData.length > 0
        ? performanceData.reduce((sum, s) => sum + s.accuracy, 0) / performanceData.length
        : 0;

    const totalQuizzesTaken = quizAttempts.length;
    const activeStudents = performanceData.length;

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Student Performance</h1>
                    <p className="text-muted-foreground font-light">
                        Track and analyze student quiz performance across your classes
                    </p>
                </div>

                {/* Class Selector */}
                {user.classes && user.classes.length > 0 && (
                    <Card className="p-6">
                        <label className="block text-sm font-medium mb-2">Select Class</label>
                        <select
                            value={selectedClass ? `${selectedClass.class}-${selectedClass.section}` : ""}
                            onChange={(e) => {
                                const [cls, sec] = e.target.value.split("-");
                                setSelectedClass({ class: parseInt(cls), section: sec });
                            }}
                            className="w-full md:w-64 px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            {user.classes.map((classItem, index) => (
                                <option key={index} value={`${classItem.class}-${classItem.section}`}>
                                    Class {classItem.class}-{classItem.section}
                                </option>
                            ))}
                        </select>
                    </Card>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-5 w-5" />
                            <span className="text-sm font-light">Total Students</span>
                        </div>
                        <div className="text-3xl font-bold text-primary">{totalStudents}</div>
                    </Card>

                    <Card className="p-6 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-5 w-5" />
                            <span className="text-sm font-light">Active Students</span>
                        </div>
                        <div className="text-3xl font-bold text-primary">{activeStudents}</div>
                    </Card>

                    <Card className="p-6 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <BarChart3 className="h-5 w-5" />
                            <span className="text-sm font-light">Total Quizzes Taken</span>
                        </div>
                        <div className="text-3xl font-bold text-primary">{totalQuizzesTaken}</div>
                    </Card>

                    <Card className="p-6 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Award className="h-5 w-5" />
                            <span className="text-sm font-light">Average Accuracy</span>
                        </div>
                        <div className="text-3xl font-bold text-primary">{averageAccuracy.toFixed(1)}%</div>
                    </Card>
                </div>

                {/* Performance Chart */}
                {isLoading ? (
                    <Card className="p-12">
                        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <Loader className="h-8 w-8 animate-spin" />
                            <p className="font-light">Loading performance data...</p>
                        </div>
                    </Card>
                ) : performanceData.length === 0 ? (
                    <Card className="p-12">
                        <div className="text-center text-muted-foreground">
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="font-light">No quiz attempts yet for this class</p>
                        </div>
                    </Card>
                ) : (
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-6">Performance by Student</h3>

                        {/* Bar Chart */}
                        <div className="space-y-4">
                            {performanceData.map((student, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium truncate max-w-[200px]">
                                            {student.studentName}
                                        </span>
                                        <div className="flex items-center gap-4 text-muted-foreground text-xs">
                                            <span>{student.correctAttempts}/{student.totalAttempts} correct</span>
                                            <span className="font-semibold text-primary">
                                                {student.accuracy.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                                        <div
                                            className={`absolute inset-y-0 left-0 rounded-lg transition-all ${student.accuracy >= 80
                                                    ? "bg-gradient-to-r from-green-500 to-green-600"
                                                    : student.accuracy >= 60
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                                        : student.accuracy >= 40
                                                            ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                                            : "bg-gradient-to-r from-red-500 to-red-600"
                                                }`}
                                            style={{ width: `${student.accuracy}%` }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-end pr-3">
                                            <span className="text-xs font-medium text-white drop-shadow">
                                                {student.accuracy >= 10 ? `${student.accuracy.toFixed(0)}%` : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Recent Quiz Attempts */}
                {quizAttempts.length > 0 && (
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Recent Quiz Attempts</h3>
                        <div className="space-y-3">
                            {quizAttempts
                                .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
                                .slice(0, 10)
                                .map((attempt) => (
                                    <div
                                        key={attempt.id}
                                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{attempt.studentName}</p>
                                            <p className="text-sm text-muted-foreground font-light truncate">
                                                {attempt.quizTitle}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(attempt.timestamp.toMillis()).toLocaleDateString()}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${attempt.isCorrect
                                                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                                                    }`}
                                            >
                                                {attempt.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </Card>
                )}
            </div>

            {/* Padding for potential bottom nav */}
            <div className="h-20" />
        </div>
    );
}
