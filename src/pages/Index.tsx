import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCard } from "@/components/ui/project-card";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  timeSpent: number;
  createdAt: Date;
  completedAt?: Date;
}

interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "active" | "paused" | "completed" | "overdue";
  deadline: Date;
  timeSpent: number;
  tasks: Task[];
}
import { TimelineView, TimelineEvent } from "@/components/ui/timeline-view";
import { PomodoroTimer } from "@/components/ui/pomodoro-timer";
import { StatsOverview } from "@/components/ui/stats-overview";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, LayoutDashboard, Calendar, Timer } from "lucide-react";
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
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "E-commerce Platform",
      description: "Building a modern online shopping platform with React and Node.js",
      progress: 75,
      status: "active",
      deadline: new Date("2024-09-15"),
      timeSpent: 720, // 12 hours
      tasks: [
        {
          id: "1",
          title: "Design User Interface",
          description: "Create wireframes and mockups for the main pages",
          status: "completed" as const,
          priority: "high" as const,
          dueDate: new Date("2024-08-20"),
          timeSpent: 240,
          createdAt: new Date("2024-08-01"),
          completedAt: new Date("2024-08-20"),
        },
        {
          id: "2",
          title: "Implement Authentication",
          description: "Set up user registration and login functionality",
          status: "in-progress" as const,
          priority: "high" as const,
          dueDate: new Date("2024-08-25"),
          timeSpent: 180,
          createdAt: new Date("2024-08-15"),
        },
        {
          id: "3",
          title: "Payment Integration",
          description: "Integrate Stripe payment gateway",
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: new Date("2024-09-01"),
          timeSpent: 0,
          createdAt: new Date("2024-08-20"),
        },
      ]
    },
    {
      id: "2", 
      title: "Mobile App Design",
      description: "UI/UX design for a fitness tracking mobile application",
      progress: 40,
      status: "active",
      deadline: new Date("2024-09-01"),
      timeSpent: 480, // 8 hours
      tasks: [
        {
          id: "4",
          title: "Wireframe Design",
          description: "Create wireframes for all app screens",
          status: "completed" as const,
          priority: "high" as const,
          dueDate: new Date("2024-08-15"),
          timeSpent: 120,
          createdAt: new Date("2024-08-01"),
          completedAt: new Date("2024-08-15"),
        },
        {
          id: "5",
          title: "Visual Design",
          description: "Create high-fidelity mockups",
          status: "in-progress" as const,
          priority: "high" as const,
          dueDate: new Date("2024-08-30"),
          timeSpent: 240,
          createdAt: new Date("2024-08-10"),
        },
      ]
    },
    {
      id: "3",
      title: "Portfolio Website",
      description: "Personal portfolio showcasing recent projects and skills",
      progress: 100,
      status: "completed",
      deadline: new Date("2024-08-20"),
      timeSpent: 360, // 6 hours
      tasks: []
    },
    {
      id: "4",
      title: "API Documentation",
      description: "Comprehensive documentation for the company's REST API",
      progress: 20,
      status: "paused",
      deadline: new Date("2024-08-25"),
      timeSpent: 180, // 3 hours
      tasks: []
    }
  ]);

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([
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
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
