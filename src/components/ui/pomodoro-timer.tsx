import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  status: string;
}

interface PomodoroTimerProps {
  projects: Project[];
  onSessionComplete?: (projectId: string, minutes: number) => void;
  className?: string;
}

export function PomodoroTimer({ 
  projects,
  onSessionComplete, 
  className 
}: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectSelectionOpen, setIsProjectSelectionOpen] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const workDuration = 25 * 60; // 25 minutes
  const breakDuration = 5 * 60; // 5 minutes
  const longBreakDuration = 15 * 60; // 15 minutes

  // Filter active projects for selection
  const activeProjects = projects.filter(p => p.status === "active");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    if (mode === "work") {
      // Work session completed
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      
      if (selectedProject) {
        onSessionComplete?.(selectedProject.id, 25);
      }
      
      // Switch to break
      const isLongBreak = newSessionCount % 4 === 0;
      setMode("break");
      setTimeLeft(isLongBreak ? longBreakDuration : breakDuration);
    } else {
      // Break completed
      setMode("work");
      setTimeLeft(workDuration);
    }
  };

  const handleStartTimer = () => {
    if (!selectedProject) {
      setIsProjectSelectionOpen(true);
      return;
    }
    
    setIsRunning(true);
    setSessionStartTime(Date.now());
  };

  const handleProjectSelect = (projectId: string) => {
    const project = activeProjects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setIsProjectSelectionOpen(false);
      setIsRunning(true);
      setSessionStartTime(Date.now());
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      handleStartTimer();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode("work");
    setTimeLeft(workDuration);
    setSelectedProject(null);
    setSessionStartTime(null);
  };

  const stopTimer = () => {
    setIsRunning(false);
    
    // Calculate and log partial session time
    if (mode === "work" && selectedProject && sessionStartTime) {
      const elapsedMinutes = Math.floor((Date.now() - sessionStartTime) / (1000 * 60));
      if (elapsedMinutes > 0) {
        onSessionComplete?.(selectedProject.id, elapsedMinutes);
      }
    }
    
    resetTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    const totalTime = mode === "work" ? workDuration : 
      (sessionCount % 4 === 0 ? longBreakDuration : breakDuration);
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <>
      <Card className={cn("shadow-card", className)}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              mode === "work" ? "bg-primary animate-pulse" : "bg-success animate-pulse"
            )} />
            {mode === "work" ? "Focus Time" : "Break Time"}
          </CardTitle>
          {selectedProject && (
            <p className="text-sm text-muted-foreground">{selectedProject.title}</p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-mono font-bold tracking-tight">
              {formatTime(timeLeft)}
            </div>
            
            <Progress 
              value={getProgress()} 
              className={cn(
                "h-2",
                mode === "work" ? "text-primary" : "text-success"
              )}
            />
            
            <div className="text-sm text-muted-foreground">
              Session {sessionCount + 1} • 
              {mode === "work" ? " Focus" : " Break"}
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <Button
              onClick={toggleTimer}
              size="lg"
              className={cn(
                "transition-bounce",
                mode === "work" ? "bg-primary" : "bg-success"
              )}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            
            <Button
              onClick={stopTimer}
              variant="outline"
              size="lg"
              disabled={!isRunning && timeLeft === workDuration}
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
            
            <Button
              onClick={resetTimer}
              variant="ghost"
              size="lg"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {sessionCount > 0 && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Completed Sessions
              </div>
              <div className="flex justify-center gap-1 mt-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-3 h-3 rounded-full",
                      i < sessionCount % 4 ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Selection Dialog */}
      <Dialog open={isProjectSelectionOpen} onOpenChange={setIsProjectSelectionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Project to Work On</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose which project you'll be focusing on during this session:
            </p>
            <div className="space-y-2">
              {activeProjects.length > 0 ? (
                activeProjects.map((project) => (
                  <Button
                    key={project.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => handleProjectSelect(project.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{project.title}</div>
                    </div>
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active projects available. Create a new project first.
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsProjectSelectionOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}