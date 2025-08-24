import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCard } from "@/components/ui/project-card";
import { useProjects } from "@/contexts/ProjectContext";
import { DataManagement } from "@/components/ui/data-management";
import { AuthModal } from "@/components/ui/auth-modal";
import type { Project } from "@/contexts/ProjectContext";


import { TimelineView } from "@/components/ui/timeline-view";
import type { TimelineEvent } from "@/contexts/ProjectContext";
import { PomodoroTimer } from "@/components/ui/pomodoro-timer";
import { StatsOverview } from "@/components/ui/stats-overview";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, LayoutDashboard, Calendar, Timer, Database, User, LogIn } from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Form validation schema
const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(1, "Project description is required"),
  deadline: z.string().min(1, "Deadline is required"),
  status: z.enum(["active", "paused", "completed"]).default("active"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const Index = () => {
  const navigate = useNavigate();
  const { projects, setProjects, timelineEvents, setTimelineEvents } = useProjects();
  
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);

  const handleToggleTimer = (projectId: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      isTimerRunning: project.id === projectId ? !project.isTimerRunning : false
    })));
  };

  const handleSessionComplete = (projectId: string, minutes: number, taskId?: string) => {
    // Update project time spent
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, timeSpent: project.timeSpent + minutes }
        : project
    ));

    // Add focus session to timeline
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const task = project.tasks?.find(t => t.id === taskId);
      const newEvent: TimelineEvent = {
        id: Date.now().toString(),
        projectId: projectId,
        projectTitle: project.title,
        title: task 
          ? `Focus Session: ${task.title}`
          : "Focus Session",
        type: "milestone",
        date: new Date(),
        status: "completed",
        description: task 
          ? `Completed ${minutes}-minute focus session on task: ${task.title}`
          : `Completed ${minutes}-minute focus session`
      };

      setTimelineEvents(prev => [newEvent, ...prev]);
    }
  };

  const handleViewProjectDetails = (projectId: string) => {
    console.log('Navigating to project details:', projectId);
    navigate(`/project/${projectId}`);
  };

  // Form setup
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: "",
      status: "active",
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    const newProject: Project = {
      id: Date.now().toString(), // Simple ID generation
      title: data.title,
      description: data.description,
      progress: 0,
      status: data.status,
      deadline: new Date(data.deadline),
      timeSpent: 0,
    };

    setProjects(prev => [...prev, newProject]);
    setIsAddProjectDialogOpen(false);
    form.reset();
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
            <Dialog open={isAddProjectDialogOpen} onOpenChange={setIsAddProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="animate-scale-in shadow-elegant"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter project title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter project description" 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select project status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddProjectDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        Create Project
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
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
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onToggleTimer={handleToggleTimer}
                  onViewDetails={handleViewProjectDetails}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <TimelineView events={timelineEvents} />
          </TabsContent>

          <TabsContent value="timer" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-1">
              <PomodoroTimer
                projects={projects}
                onSessionComplete={handleSessionComplete}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <DataManagement />
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Account & Sync
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AuthModal>
                      <Button className="w-full">
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In / Sign Up
                      </Button>
                    </AuthModal>
                    <p className="text-xs text-muted-foreground mt-3">
                      • Sign in to sync your data across devices
                      <br />
                      • Your data is always saved locally by default
                      <br />
                      • Export your data regularly for backup
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
