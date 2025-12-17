import { useActivity } from "@/context/ActivityContext";
import { Card } from "@/components/Card";
import {
  Calendar,
  Plus,
  Clock,
  BookOpen,
  Bell,
  LogIn,
  CheckCircle,
} from "lucide-react";

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  login: LogIn,
  timetable_update: Calendar,
  quiz_create: Plus,
  quiz_update: Plus,
  material_upload: BookOpen,
  announcement: Bell,
  quiz_attempt: CheckCircle,
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(date).toLocaleDateString();
}

export function RecentActivity() {
  const { activities } = useActivity();

  if (activities.length === 0) {
    return (
      <section className="space-y-4">
        <h3 className="text-2xl font-bold">Recent Activity</h3>
        <Card className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-light">No activities yet</p>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h3 className="text-2xl font-bold">Recent Activity</h3>

      <Card className="p-6 space-y-4">
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type] || Clock;
            return (
              <div
                key={activity.id}
                className="flex items-center gap-4 pb-3 border-b border-border last:border-0"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{activity.title}</p>
                  <p className="text-sm text-muted-foreground font-light truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground font-light whitespace-nowrap">
                  {getRelativeTime(activity.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
