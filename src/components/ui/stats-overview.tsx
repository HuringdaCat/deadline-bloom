import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Clock, Target, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTimeSpent: number; // in minutes
  thisWeekTime: number; // in minutes
  className?: string;
}

export function StatsOverview({
  totalProjects,
  activeProjects,
  completedProjects,
  totalTimeSpent,
  thisWeekTime,
  className
}: StatsOverviewProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
  const weeklyGoal = 40 * 60; // 40 hours in minutes
  const weeklyProgress = (thisWeekTime / weeklyGoal) * 100;

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      icon: Target,
      className: "text-primary"
    },
    {
      title: "Active Projects", 
      value: activeProjects,
      icon: TrendingUp,
      className: "text-status-active"
    },
    {
      title: "Completed",
      value: completedProjects,
      icon: CheckCircle,
      className: "text-status-completed"
    },
    {
      title: "Total Time",
      value: formatTime(totalTimeSpent),
      icon: Clock,
      className: "text-info"
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-card hover:shadow-hover transition-smooth">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={cn("h-8 w-8", stat.className)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-status-completed" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Projects completed</span>
              <span className="font-medium">{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completedProjects} of {totalProjects} projects completed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-info" />
              Weekly Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">This week</span>
              <span className="font-medium">{formatTime(thisWeekTime)} / 40h</span>
            </div>
            <Progress 
              value={Math.min(weeklyProgress, 100)} 
              className={cn(
                "h-2",
                weeklyProgress >= 100 ? "text-status-completed" : "text-primary"
              )}
            />
            <p className="text-xs text-muted-foreground">
              {weeklyProgress >= 100 ? "🎉 Goal achieved!" : `${(weeklyGoal - thisWeekTime) / 60}h remaining`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}