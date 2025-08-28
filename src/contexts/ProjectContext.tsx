import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage, exportData, importData } from '@/hooks/useLocalStorage';

export interface Task {
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

export interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "active" | "paused" | "completed" | "overdue";
  deadline: Date;
  timeSpent: number;
  tasks: Task[];
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  type: "milestone" | "deadline" | "meeting" | "review";
  date: Date;
  status: "upcoming" | "today" | "overdue" | "completed";
  description?: string;
}

interface ProjectData {
  projects: Project[];
  timelineEvents: TimelineEvent[];
  lastUpdated: string;
  version: string;
}

interface ProjectContextType {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  timelineEvents: TimelineEvent[];
  setTimelineEvents: (events: TimelineEvent[]) => void;
  exportUserData: () => void;
  importUserData: (file: File) => Promise<boolean>;
  clearAllData: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const defaultData: ProjectData = {
  projects: [
    {
      id: "1",
      title: "E-commerce Platform",
      description: "Building a modern online shopping platform with React and Node.js",
      progress: 75,
      status: "active",
      deadline: new Date("2024-09-15"),
      timeSpent: 720,
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
      ]
    },
    {
      id: "2", 
      title: "Mobile App Design",
      description: "UI/UX design for a fitness tracking mobile application",
      progress: 40,
      status: "active",
      deadline: new Date("2024-09-01"),
      timeSpent: 480,
      tasks: [
        {
          id: "4",
          title: "Wireframe Design",
          description: "Create wireframes for all app screens",
          status: "completed",
          priority: "high",
          dueDate: new Date("2024-08-15"),
          timeSpent: 120,
          createdAt: new Date("2024-08-01"),
          completedAt: new Date("2024-08-15"),
        },
        {
          id: "5",
          title: "Visual Design",
          description: "Create high-fidelity mockups",
          status: "in-progress",
          priority: "high",
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
      timeSpent: 360,
      tasks: []
    },
    {
      id: "4",
      title: "API Documentation",
      description: "Comprehensive documentation for the company's REST API",
      progress: 20,
      status: "paused",
      deadline: new Date("2024-08-25"),
      timeSpent: 180,
      tasks: []
    }
  ],
  timelineEvents: [
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
  ],
  lastUpdated: new Date().toISOString(),
  version: "1.0.0"
};

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const [projectData, setProjectData] = useLocalStorage<ProjectData>('deadline-bloom-data', defaultData);

  // Ensure projectData has the required structure, fallback to defaultData if not
  const safeProjectData = projectData && 
    Array.isArray(projectData.projects) && 
    Array.isArray(projectData.timelineEvents) 
    ? projectData 
    : defaultData;

  // Convert date strings back to Date objects when loading from localStorage
  const projects = safeProjectData.projects.map(project => ({
    ...project,
    deadline: new Date(project.deadline),
    tasks: project.tasks.map(task => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      createdAt: new Date(task.createdAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    }))
  }));

  const timelineEvents = safeProjectData.timelineEvents.map(event => ({
    ...event,
    date: new Date(event.date)
  }));

  // Ensure data is properly initialized
  useEffect(() => {
    if (!projectData || !projectData.projects || !projectData.timelineEvents) {
      console.log('Initializing project data with defaults');
      setProjectData(defaultData);
    }
  }, [projectData, setProjectData]);

  const setProjects = (newProjects: Project[]) => {
    setProjectData(prev => ({
      ...prev,
      projects: newProjects,
      lastUpdated: new Date().toISOString()
    }));
  };

  const setTimelineEvents = (newEvents: TimelineEvent[]) => {
    setProjectData(prev => ({
      ...prev,
      timelineEvents: newEvents,
      lastUpdated: new Date().toISOString()
    }));
  };

  const exportUserData = () => {
    const dataToExport = {
      ...projectData,
      lastUpdated: new Date().toISOString()
    };
    exportData(dataToExport, `deadline-bloom-backup-${new Date().toISOString().split('T')[0]}.json`);
  };

  const importUserData = async (file: File): Promise<boolean> => {
    try {
      const importedData = await importData(file);
      
      // Validate the imported data structure
      if (!importedData.projects || !importedData.timelineEvents) {
        throw new Error('Invalid data format');
      }

      // Convert date strings to Date objects
      const processedData: ProjectData = {
        projects: importedData.projects.map((project: any) => ({
          ...project,
          deadline: new Date(project.deadline),
          tasks: project.tasks.map((task: any) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            createdAt: new Date(task.createdAt),
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          }))
        })),
        timelineEvents: importedData.timelineEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        })),
        lastUpdated: new Date().toISOString(),
        version: importedData.version || "1.0.0"
      };

      setProjectData(processedData);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  const clearAllData = () => {
    // Reset to completely blank state - no projects, no timeline events
    const resetData: ProjectData = {
      projects: [],
      timelineEvents: [],
      lastUpdated: new Date().toISOString(),
      version: "1.0.0"
    };
    setProjectData(resetData);
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      setProjects,
      timelineEvents,
      setTimelineEvents,
      exportUserData,
      importUserData,
      clearAllData
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
