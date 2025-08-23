import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCard, Project } from "@/components/ui/project-card";
import { TimelineView, TimelineEvent } from "@/components/ui/timeline-view";
import { PomodoroTimer } from "@/components/ui/pomodoro-timer";
import { StatsOverview } from "@/components/ui/stats-overview";
import { Plus, LayoutDashboard, Calendar, Timer } from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "E-commerce Platform",
      description: "Building a modern online shopping platform with React and Node.js",
      progress: 75,
      status: "active",
      deadline: new Date("2024-09-15"),
      timeSpent: 720, // 12 hours
    },
    {
      id: "2", 
      title: "Mobile App Design",
      description: "UI/UX design for a fitness tracking mobile application",
      progress: 40,
      status: "active",
      deadline: new Date("2024-09-01"),
      timeSpent: 480, // 8 hours
    },
    {
      id: "3",
      title: "Portfolio Website",
      description: "Personal portfolio showcasing recent projects and skills",
      progress: 100,
      status: "completed",
      deadline: new Date("2024-08-20"),
      timeSpent: 360, // 6 hours
    },
    {
      id: "4",
      title: "API Documentation",
      description: "Comprehensive documentation for the company's REST API",
      progress: 20,
      status: "paused",
      deadline: new Date("2024-08-25"),
      timeSpent: 180, // 3 hours
    }
  ]);

  const [timelineEvents] = useState<TimelineEvent[]>([
    {
      id: "1",
      projectId: "1",
      projectTitle: "E-commerce Platform",
      title: "MVP Launch",
      type: "deadline",
      date: new Date("2024-09-15"),
      status: "upcoming",
      description: "Launch minimum viable product to production"
    },
    {
      id: "2",
      projectId: "2",
      projectTitle: "Mobile App Design",
      title: "Design Review",
      type: "meeting",
      date: new Date("2024-09-01"),
      status: "upcoming",
      description: "Final design review with stakeholders"
    },
    {
      id: "3",
      projectId: "1",
      projectTitle: "E-commerce Platform",
      title: "Payment Integration",
      type: "milestone",
      date: new Date("2024-08-28"),
      status: "upcoming",
      description: "Complete Stripe payment gateway integration"
    },
    {
      id: "4",
      projectId: "4",
      projectTitle: "API Documentation",
      title: "Documentation Review",
      type: "review",
      date: new Date("2024-08-25"),
      status: "overdue",
      description: "Technical review of API documentation"
    }
  ]);

  const [activeTimer, setActiveTimer] = useState<string | null>(null);

  const handleToggleTimer = (projectId: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      isTimerRunning: project.id === projectId ? !project.isTimerRunning : false
    })));
    
    setActiveTimer(prev => prev === projectId ? null : projectId);
  };

  const handleSessionComplete = (projectId: string, minutes: number) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, timeSpent: project.timeSpent + minutes }
        : project
    ));
  };

  const activeProjects = projects.filter(p => p.status === "active").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const totalTimeSpent = projects.reduce((acc, p) => acc + p.timeSpent, 0);
  const thisWeekTime = 1200; // Mock data: 20 hours this week

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary">
        <div className="absolute inset-0 bg-black/20" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              Project Tracker
            </h1>
            <p className="text-xl mb-8 opacity-90 animate-slide-up">
              Manage your projects, track time, and hit your deadlines with ease
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="animate-scale-in shadow-elegant"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <StatsOverview
          totalProjects={projects.length}
          activeProjects={activeProjects}
          completedProjects={completedProjects}
          totalTimeSpent={totalTimeSpent}
          thisWeekTime={thisWeekTime}
          className="mb-8"
        />

        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Timer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onToggleTimer={handleToggleTimer}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <TimelineView events={timelineEvents} />
          </TabsContent>

          <TabsContent value="timer" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <PomodoroTimer
                projectId={activeTimer || undefined}
                projectTitle={activeTimer ? projects.find(p => p.id === activeTimer)?.title : undefined}
                onSessionComplete={handleSessionComplete}
              />
              
              {activeTimer && (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Active Project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const project = projects.find(p => p.id === activeTimer);
                      return project ? (
                        <ProjectCard 
                          project={project}
                          onToggleTimer={handleToggleTimer}
                        />
                      ) : null;
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
