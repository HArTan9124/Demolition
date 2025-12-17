import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { useFiles } from "@/context/FileContext";
import { useUser } from "@/context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, BookOpen, BarChart3, User, FileText, Download, Trash2 } from "lucide-react";

export default function TimetableUpload() {
  const { user } = useUser();
  const { files, deleteFile } = useFiles();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.userType !== "teacher") {
      navigate("/teacher-login");
    }
  }, [user, navigate]);

  if (!user || user.userType !== "teacher") return null;

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      deleteFile(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Upload Timetable</h1>
          <p className="text-muted-foreground font-light">
            Upload class timetables, schedules, and related documents
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-8">
          <FileUpload />
        </Card>

        {/* All Uploaded Files */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">All Uploaded Files</h2>
            <span className="text-sm text-muted-foreground font-light">
              Total: {files.length}
            </span>
          </div>

          {files.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground font-light">
              <p>No files uploaded yet. Start by uploading your first file above.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <Card key={file.id} className="p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {file.type === "pdf" ? (
                        <FileText className="h-6 w-6 text-red-500 flex-shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img
                            src={file.base64}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground font-light">
                          {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                          {new Date(file.uploadedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={file.base64}
                        download={file.name}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Info Card */}
        <Card className="p-6 bg-primary/5 border border-primary/20">
          <h3 className="font-semibold mb-2">📌 Students will see these files</h3>
          <p className="text-sm text-muted-foreground font-light">
            All uploaded files will be visible to your students in their timetable section on the
            dashboard. They can view and download any file you upload here.
          </p>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-around h-20">
          <NavItem icon={Home} label="Home" to="/teacher-dashboard" />
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
