import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";

export default function Placeholder() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <Card className="p-12 md:p-16 space-y-8 text-center">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Coming Soon
              </h1>
              <p className="text-lg text-muted-foreground font-light max-w-md mx-auto">
                This page is being built. Let's continue constructing your learning management system!
              </p>
            </div>

            <div className="bg-gradient-primary/10 border border-primary/20 rounded-2xl p-6">
              <p className="text-sm text-foreground font-light">
                💡 <span className="font-medium">Keep building:</span> Ask me to create specific pages like Teacher Dashboard, Student Dashboard, Courses, Progress Analytics, Schedule, or Profile pages.
              </p>
            </div>

            <Link to="/">
              <Button variant="gradient" size="lg" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
