import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Play, Pause, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "active" | "paused" | "completed" | "overdue";
  deadline: Date;
  timeSpent: number; // in minutes
  isTimerRunning?: boolean;
}

interface ProjectCardProps {
  project: Project;
  onToggleTimer?: (projectId: string) => void;
  onViewDetails?: (projectId: string) => void;
}

const statusConfig = {
  active: {
    className: "bg-status-active text-status-active-foreground",
    label: "Active"
  },
  paused: {
    className: "bg-status-paused text-status-paused-foreground", 
    label: "Paused"
  },
  completed: {
    className: "bg-status-completed text-status-completed-foreground",
    label: "Completed"
  },
  overdue: {
    className: "bg-status-overdue text-destructive-foreground",
    label: "Overdue"
  }
};

export function ProjectCard({ project, onToggleTimer, onViewDetails }: ProjectCardProps) {
  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDeadline = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days left`;
  };

  const statusInfo = statusConfig[project.status];

  return (
    <Card className="group relative overflow-hidden shadow-card hover:shadow-hover transition-smooth animate-fade-in">
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-smooth pointer-events-none" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold leading-tight">
              {project.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-smooth">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <Badge className={cn("text-xs font-medium", statusInfo.className)}>
            {statusInfo.label}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDeadline(project.deadline)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{project.progress}%</span>
          </div>
          <Progress 
            value={project.progress} 
            className="h-2 bg-secondary"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {formatTimeSpent(project.timeSpent)}
          </div>
          
          <Button
            variant={project.isTimerRunning ? "destructive" : "default"}
            size="sm"
            onClick={() => onToggleTimer?.(project.id)}
            className="h-8 px-3 transition-bounce"
          >
            {project.isTimerRunning ? (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Start
              </>
            )}
          </Button>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          variant="default" 
          className="w-full transition-smooth hover:bg-primary/90"
          onClick={() => {
            console.log('View Details clicked for project:', project.id);
            onViewDetails?.(project.id);
          }}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}