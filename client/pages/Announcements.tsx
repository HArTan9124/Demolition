import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { firestore } from "@/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    Timestamp,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    arrayUnion
} from "firebase/firestore";
import { Bell, Send, Loader, MessageCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
    id: string;
    sender: string;
    senderType: "teacher" | "student";
    message: string;
    timestamp: Timestamp;
}

interface Announcement {
    id: string;
    title: string;
    message: string;
    class: number;
    section: string;
    teacherEmail: string;
    teacherName: string;
    createdAt: Timestamp;
    chat: Message[];
}

export default function Announcements() {
    const { user } = useUser();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [selectedClass, setSelectedClass] = useState<{ class: number; section: string } | null>(null);
    const [formData, setFormData] = useState({ title: "", message: "" });
    const [isCreating, setIsCreating] = useState(false);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [chatMessage, setChatMessage] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate(user?.userType === "teacher" ? "/teacher-login" : "/student-login");
            return;
        }

        // Set default class for teachers
        if (user.userType === "teacher" && user.classes && user.classes.length > 0 && !selectedClass) {
            setSelectedClass(user.classes[0]);
        }

        loadAnnouncements();
    }, [user, selectedClass]);

    const loadAnnouncements = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const announcementsRef = collection(firestore, "announcements");
            let q;

            if (user.userType === "teacher") {
                // Teacher sees their own announcements
                q = query(
                    announcementsRef,
                    where("teacherEmail", "==", user.email),
                    orderBy("createdAt", "desc")
                );
            } else {
                // Student sees announcements for their class
                q = query(
                    announcementsRef,
                    where("class", "==", user.class),
                    where("section", "==", user.section),
                    orderBy("createdAt", "desc")
                );
            }

            const snapshot = await getDocs(q);
            const loadedAnnouncements: Announcement[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                chat: doc.data().chat || [],
            } as Announcement));

            setAnnouncements(loadedAnnouncements);
        } catch (error) {
            console.error("Error loading announcements:", error);
            toast({
                title: "Error",
                description: "Failed to load announcements",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.userType !== "teacher" || !selectedClass) return;

        setIsCreating(true);
        try {
            const announcementsRef = collection(firestore, "announcements");
            await addDoc(announcementsRef, {
                title: formData.title,
                message: formData.message,
                class: selectedClass.class,
                section: selectedClass.section,
                teacherEmail: user.email,
                teacherName: user.name,
                createdAt: Timestamp.now(),
                chat: [],
            });

            toast({
                title: "Success",
                description: "Announcement created successfully",
            });

            setFormData({ title: "", message: "" });
            loadAnnouncements();
        } catch (error) {
            console.error("Error creating announcement:", error);
            toast({
                title: "Error",
                description: "Failed to create announcement",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleSendMessage = async (announcementId: string) => {
        if (!chatMessage.trim() || !user) return;

        setIsSendingMessage(true);
        try {
            const announcementRef = doc(firestore, "announcements", announcementId);
            const newMessage: Omit<Message, "id"> = {
                sender: user.name,
                senderType: user.userType,
                message: chatMessage,
                timestamp: Timestamp.now(),
            };

            await updateDoc(announcementRef, {
                chat: arrayUnion(newMessage),
            });

            setChatMessage("");
            loadAnnouncements();
        } catch (error) {
            console.error("Error sending message:", error);
            toast({
                title: "Error",
                description: "Failed to send message",
                variant: "destructive",
            });
        } finally {
            setIsSendingMessage(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Bell className="h-8 w-8" />
                        Announcements
                    </h1>
                    <p className="text-muted-foreground font-light">
                        {user.userType === "teacher"
                            ? "Create and manage announcements for your classes"
                            : "View announcements from your teachers"}
                    </p>
                </div>

                {/* Teacher: Class Selector & Create Form */}
                {user.userType === "teacher" && user.classes && user.classes.length > 0 && (
                    <>
                        <Card className="p-6 space-y-4">
                            <label className="block text-sm font-medium">Select Class</label>
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

                        <Card className="p-6">
                            <h3 className="text-xl font-bold mb-4">Create New Announcement</h3>
                            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Announcement title..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Message</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Write your announcement..."
                                        rows={4}
                                        className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        required
                                    />
                                </div>
                                <Button type="submit" variant="gradient" disabled={isCreating}>
                                    {isCreating ? (
                                        <>
                                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Announcement"
                                    )}
                                </Button>
                            </form>
                        </Card>
                    </>
                )}

                {/* Announcements List */}
                {isLoading ? (
                    <Card className="p-12">
                        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <Loader className="h-8 w-8 animate-spin" />
                            <p className="font-light">Loading announcements...</p>
                        </div>
                    </Card>
                ) : announcements.length === 0 ? (
                    <Card className="p-12">
                        <div className="text-center text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="font-light">No announcements yet</p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <Card key={announcement.id} className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-bold">{announcement.title}</h3>
                                            {announcement.chat.length > 0 && (
                                                <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                                    {announcement.chat.length}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {user.userType === "student" && `By ${announcement.teacherName} • `}
                                            Class {announcement.class}-{announcement.section} • {" "}
                                            {new Date(announcement.createdAt.toMillis()).toLocaleString()}
                                        </p>
                                        <p className="text-foreground">{announcement.message}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActiveChat(activeChat === announcement.id ? null : announcement.id)}
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* Chat Section */}
                                {activeChat === announcement.id && (
                                    <div className="border-t border-border pt-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold">Discussion</h4>
                                            <button onClick={() => setActiveChat(null)}>
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Messages */}
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {announcement.chat.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                    No messages yet. Start the conversation!
                                                </p>
                                            ) : (
                                                announcement.chat.map((msg, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex ${msg.sender === user.name ? "justify-end" : "justify-start"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] p-3 rounded-lg ${msg.sender === user.name
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "bg-muted"
                                                                }`}
                                                        >
                                                            <p className="text-xs font-medium mb-1">
                                                                {msg.sender}
                                                                <span className="ml-2 opacity-70">
                                                                    ({msg.senderType})
                                                                </span>
                                                            </p>
                                                            <p className="text-sm">{msg.message}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Send Message */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={chatMessage}
                                                onChange={(e) => setChatMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                className="flex-1 px-4 py-2 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage(announcement.id);
                                                    }
                                                }}
                                            />
                                            <Button
                                                onClick={() => handleSendMessage(announcement.id)}
                                                disabled={!chatMessage.trim() || isSendingMessage}
                                                size="icon"
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-20" />
        </div>
    );
}
