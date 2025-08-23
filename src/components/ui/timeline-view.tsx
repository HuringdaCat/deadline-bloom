import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  type: "deadline" | "milestone" | "meeting" | "review";
  date: Date;
  status: "upcoming" | "today" | "overdue" | "completed";
  description?: string;
}

interface TimelineViewProps {
  events: TimelineEvent[];
  className?: string;
}

const typeConfig = {
  deadline: {
    icon: Calendar,
    className: "bg-destructive text-destructive-foreground",
    label: "Deadline"
  },
  milestone: {
    icon: Flag,
    className: "bg-primary text-primary-foreground",
    label: "Milestone"
  },
  meeting: {
    icon: Clock,
    className: "bg-info text-info-foreground",
    label: "Meeting"
  },
  review: {
    icon: Flag,
    className: "bg-warning text-warning-foreground",
    label: "Review"
  }
};

const statusConfig = {
  upcoming: "border-l-muted",
  today: "border-l-primary",
  overdue: "border-l-destructive",
  completed: "border-l-success opacity-60"
};

export function TimelineView({ events, className }: TimelineViewProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
    
    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  };

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = event.date.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <Card className={cn("shadow-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedDates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming events</p>
          </div>
        ) : (
          sortedDates.map((dateKey) => {
            const dateEvents = groupedEvents[dateKey];
            const date = new Date(dateKey);
            
            return (
              <div key={dateKey} className="space-y-3">
                <div className="sticky top-0 bg-background/80 backdrop-blur-sm py-2 border-b">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {formatDate(date)}
                  </h3>
                </div>
                
                <div className="space-y-3 pl-4">
                  {dateEvents.map((event) => {
                    const typeInfo = typeConfig[event.type];
                    const Icon = typeInfo.icon;
                    
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "relative border-l-4 pl-6 pb-4 transition-smooth hover:bg-muted/30 rounded-r-lg",
                          statusConfig[event.status]
                        )}
                      >
                        <div className="absolute -left-2 top-2 w-4 h-4 bg-background border-2 border-current rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-current rounded-full" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge className={cn("text-xs", typeInfo.className)}>
                                  <Icon className="h-3 w-3 mr-1" />
                                  {typeInfo.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(event.date)}
                                </span>
                              </div>
                              <h4 className="font-medium text-sm">
                                {event.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {event.projectTitle}
                              </p>
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}