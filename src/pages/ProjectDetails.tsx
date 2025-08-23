import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TimelineView, TimelineEvent } from "@/components/ui/timeline-view";
import { PomodoroTimer } from "@/components/ui/pomodoro-timer";
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  Clock as ClockIcon,
  Target,
  BarChart3,
  ListTodo
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  timeSpent: number; // in minutes
  createdAt: Date;
  completedAt?: Date;
}

// Project interface (extended)
interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "active" | "paused" | "completed" | "overdue";
  deadline: Date;
  timeSpent: number; // in minutes
  tasks: Task[];
  timelineEvents: TimelineEvent[];
}

// Form validation schemas
const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
});

const timelineEventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  type: z.enum(["milestone", "deadline", "meeting", "review"]).default("milestone"),
  date: z.string().min(1, "Date is required"),
});

type TaskFormData = z.infer<typeof taskSchema>;
type TimelineEventFormData = z.infer<typeof timelineEventSchema>;

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  // Mock project data - in a real app, this would come from an API or context
  const [project, setProject] = useState<Project | null>(null);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);

  // Forms
  const taskForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
    },
  });

  const eventForm = useForm<TimelineEventFormData>({
    resolver: zodResolver(timelineEventSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "milestone",
      date: "",
    },
  });

  // Mock data initialization
  useEffect(() => {
    if (projectId) {
      // Mock project data - in a real app, fetch from API
      const mockProject: Project = {
        id: projectId,
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
            status: "completed",
            priority: "high",
            dueDate: new Date("2024-08-20"),
            timeSpent: 240,
            createdAt: new Date("2024-08-01"),
            completedAt: new Date("2024-08-20"),
          },
          {
            id: "2",
            title: "Implement Authentication",
            description: "Set up user registration and login functionality",
            status: "in-progress",
            priority: "high",
            dueDate: new Date("2024-08-25"),
            timeSpent: 180,
            createdAt: new Date("2024-08-15"),
          },
          {
            id: "3",
            title: "Payment Integration",
            description: "Integrate Stripe payment gateway",
            status: "todo",
            priority: "medium",
            dueDate: new Date("2024-09-01"),
            timeSpent: 0,
            createdAt: new Date("2024-08-20"),
          },
          {
            id: "4",
            title: "Product Catalog",
            description: "Build product listing and detail pages",
            status: "todo",
            priority: "medium",
            dueDate: new Date("2024-08-30"),
            timeSpent: 0,
            createdAt: new Date("2024-08-18"),
          },
        ],
        timelineEvents: [
          {
            id: "1",
            projectId: projectId,
            projectTitle: "E-commerce Platform",
            title: "MVP Launch",
            type: "deadline",
            date: new Date("2024-09-15"),
            status: "upcoming",
            description: "Launch minimum viable product to production"
          },
          {
            id: "2",
            projectId: projectId,
            projectTitle: "E-commerce Platform",
            title: "Payment Integration Complete",
            type: "milestone",
            date: new Date("2024-09-01"),
            status: "upcoming",
            description: "Complete Stripe payment gateway integration"
          },
          {
            id: "3",
            projectId: projectId,
            projectTitle: "E-commerce Platform",
            title: "Design Review",
            type: "meeting",
            date: new Date("2024-08-20"),
            status: "completed",
            description: "Final design review with stakeholders"
          },
        ],
      };
      setProject(mockProject);
    }
  }, [projectId]);

  const handleAddTask = (data: TaskFormData) => {
    if (!project) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description || "",
      status: "todo",
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      timeSpent: 0,
      createdAt: new Date(),
    };

    setProject(prev => prev ? {
      ...prev,
      tasks: [...prev.tasks, newTask]
    } : null);

    setIsAddTaskDialogOpen(false);
    taskForm.reset();
  };

  const handleAddEvent = (data: TimelineEventFormData) => {
    if (!project) return;

    const newEvent: TimelineEvent = {
      id: Date.now().toString(),
      projectId: project.id,
      projectTitle: project.title,
      title: data.title,
      description: data.description || "",
      type: data.type,
      date: new Date(data.date),
      status: "upcoming",
    };

    setProject(prev => prev ? {
      ...prev,
      timelineEvents: [...prev.timelineEvents, newEvent]
    } : null);

    setIsAddEventDialogOpen(false);
    eventForm.reset();
  };

  const handleTaskStatusChange = (taskId: string, newStatus: Task["status"]) => {
    if (!project) return;

    setProject(prev => prev ? {
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus,
              completedAt: newStatus === "completed" ? new Date() : undefined
            }
          : task
      )
    } : null);
  };

  const handleSessionComplete = (projectId: string, minutes: number) => {
    setProject(prev => prev ? {
      ...prev,
      timeSpent: prev.timeSpent + minutes
    } : null);
  };

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

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress": return <Circle className="h-4 w-4 text-blue-600" />;
      case "todo": return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  const completedTasks = project.tasks.filter(t => t.status === "completed").length;
  const totalTasks = project.tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground mt-2">{project.description}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant={project.status === "active" ? "default" : "secondary"}>
                {project.status}
              </Badge>
              <div className="text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 inline mr-1" />
                {formatDeadline(project.deadline)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Project Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Progress</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{project.progress}%</div>
                <Progress value={project.progress} className="mt-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Time Spent</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{formatTimeSpent(project.timeSpent)}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Tasks</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
                <Progress value={taskProgress} className="mt-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <div className="mt-2">
                <Badge variant={project.status === "active" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-96">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Tasks</h2>
              <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <Form {...taskForm}>
                    <form onSubmit={taskForm.handleSubmit(handleAddTask)} className="space-y-4">
                      <FormField
                        control={taskForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter task title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={taskForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter task description" 
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={taskForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={taskForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddTaskDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Add Task
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {project.tasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={task.status === "completed"}
                          onCheckedChange={(checked) => 
                            handleTaskStatusChange(task.id, checked ? "completed" : "todo")
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={cn(
                              "font-medium",
                              task.status === "completed" && "line-through text-muted-foreground"
                            )}>
                              {task.title}
                            </h3>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            {task.status === "in-progress" && (
                              <Badge variant="secondary">In Progress</Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeSpent(task.timeSpent)}
                            </span>
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {task.dueDate.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Timeline</h2>
              <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Timeline Event</DialogTitle>
                  </DialogHeader>
                  <Form {...eventForm}>
                    <form onSubmit={eventForm.handleSubmit(handleAddEvent)} className="space-y-4">
                      <FormField
                        control={eventForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter event title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter event description" 
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="milestone">Milestone</SelectItem>
                                <SelectItem value="deadline">Deadline</SelectItem>
                                <SelectItem value="meeting">Meeting</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddEventDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Add Event
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            <TimelineView events={project.timelineEvents} />
          </TabsContent>

          {/* Timer Tab */}
          <TabsContent value="timer" className="space-y-6">
            <h2 className="text-xl font-semibold">Focus Timer</h2>
            <div className="grid gap-6 lg:grid-cols-1">
              <PomodoroTimer
                projects={[project]}
                onSessionComplete={handleSessionComplete}
              />
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <h2 className="text-xl font-semibold">Project Overview</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <p className="text-sm">{project.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm">{project.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={project.status === "active" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Deadline</label>
                    <p className="text-sm">{project.deadline.toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Time Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Time Spent</label>
                    <p className="text-2xl font-bold">{formatTimeSpent(project.timeSpent)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tasks Completed</label>
                    <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Overall Progress</label>
                    <div className="flex items-center gap-2">
                      <Progress value={project.progress} className="flex-1" />
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetails;
