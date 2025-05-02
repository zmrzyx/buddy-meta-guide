
// This is a mock database service using localStorage for the prototype
// In a real application, this would connect to a real database

export interface User {
  userId: string;
  email: string;
  displayName: string;
  marketingGoal?: string;
  preferredFormat?: string;
  primaryChannel?: string;
  createdAt: Date;
  progress?: {
    [moduleId: string]: {
      completed: boolean;
      lastAccessed: Date;
      percentComplete: number;
    }
  };
  points?: number;
}

export interface ContentModule {
  moduleId: string;
  title: string;
  summary: string;
  type: "Course" | "Video" | "AI_Prompt";
  sourceUrl?: string;
  goalTags: string[];
  channelTags: string[];
  promptTemplate?: string;
  pointValue?: number;
}

// Mock data for content modules
const mockContentModules: ContentModule[] = [
  {
    moduleId: "mod-1",
    title: "Facebook Ads Basics for Local Shops",
    summary: "Learn how to create simple ads that bring local customers to your store.",
    type: "Course",
    sourceUrl: "#",
    goalTags: ["increase_sales", "local_awareness"],
    channelTags: ["facebook"],
    pointValue: 100,
  },
  {
    moduleId: "mod-2",
    title: "Instagram Content Calendar for Beginners",
    summary: "A simple weekly plan to keep your Instagram fresh without spending hours.",
    type: "Course",
    sourceUrl: "#",
    goalTags: ["increase_engagement", "brand_awareness"],
    channelTags: ["instagram"],
    pointValue: 100,
  },
  {
    moduleId: "mod-3",
    title: "WhatsApp Business Features You Should Use",
    summary: "Make customer communication easier with these simple WhatsApp tools.",
    type: "Video",
    sourceUrl: "#",
    goalTags: ["customer_service", "increase_sales"],
    channelTags: ["whatsapp"],
    pointValue: 50,
  },
  {
    moduleId: "mod-4",
    title: "Create Your First Facebook Ad",
    summary: "Step by step guide to launching an effective Facebook ad without confusion.",
    type: "Video",
    sourceUrl: "#",
    goalTags: ["increase_sales", "brand_awareness"],
    channelTags: ["facebook"],
    pointValue: 50,
  },
  {
    moduleId: "mod-5",
    title: "Instagram Story Ideas for Your Business",
    summary: "Quick and easy story ideas to keep customers engaged daily.",
    type: "AI_Prompt",
    goalTags: ["increase_engagement", "brand_awareness"],
    channelTags: ["instagram"],
    promptTemplate: "I need 5 simple Instagram Story ideas for a [type of business] that wants to [specific goal]. Each idea should be quick to create and use everyday items or simple phone camera shots.",
    pointValue: 25,
  },
  {
    moduleId: "mod-6",
    title: "Facebook Post Ideas for Local Businesses",
    summary: "Get locals excited about your business with these post templates.",
    type: "AI_Prompt",
    goalTags: ["local_awareness", "increase_engagement"],
    channelTags: ["facebook"],
    promptTemplate: "I run a local [type of business] and need 5 Facebook post ideas that would encourage people in my community to visit my store. The posts should be friendly and highlight why local customers would want to stop by.",
    pointValue: 25,
  },
  {
    moduleId: "mod-7",
    title: "WhatsApp Customer Service Templates",
    summary: "Copy and paste responses for common customer questions.",
    type: "AI_Prompt",
    goalTags: ["customer_service"],
    channelTags: ["whatsapp"],
    promptTemplate: "I need 5 professional but friendly WhatsApp message templates for responding to customers of my [type of business]. Include templates for: 1) Answering product questions, 2) Handling complaints politely, 3) Following up after a purchase, 4) Announcing a new product/service, 5) Thanking a repeat customer.",
    pointValue: 25,
  },
  {
    moduleId: "mod-8",
    title: "Simple Meta Ads Strategy for Small Budgets",
    summary: "Make the most of a small budget across Facebook, Instagram and WhatsApp.",
    type: "Course",
    sourceUrl: "#",
    goalTags: ["increase_sales", "brand_awareness", "local_awareness"],
    channelTags: ["facebook", "instagram", "whatsapp"],
    pointValue: 100,
  },
  {
    moduleId: "mod-9",
    title: "Taking Better Product Photos with Your Phone",
    summary: "No fancy camera needed - learn to take great photos for your social media.",
    type: "Video",
    sourceUrl: "#",
    goalTags: ["increase_engagement", "brand_awareness"],
    channelTags: ["instagram", "facebook"],
    pointValue: 50,
  },
  {
    moduleId: "mod-10",
    title: "WhatsApp Business Catalog Setup",
    summary: "Show your products directly in WhatsApp with this simple catalog.",
    type: "Course",
    sourceUrl: "#",
    goalTags: ["increase_sales"],
    channelTags: ["whatsapp"],
    pointValue: 100,
  },
];

// Database service functions
export const db = {
  // Auth functions
  users: {
    create: (email: string, displayName: string): User => {
      const newUser: User = {
        userId: `user_${Date.now()}`,
        email,
        displayName,
        createdAt: new Date(),
        progress: {},
        points: 0
      };
      
      localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
      return newUser;
    },
    
    getByEmail: (email: string): User | null => {
      const userData = localStorage.getItem(`user_${email}`);
      return userData ? JSON.parse(userData) : null;
    },
    
    update: (email: string, data: Partial<User>): User | null => {
      const user = db.users.getByEmail(email);
      if (!user) return null;
      
      const updatedUser = { ...user, ...data };
      localStorage.setItem(`user_${email}`, JSON.stringify(updatedUser));
      return updatedUser;
    }
  },
  
  // Content module functions
  contentModules: {
    getAll: (): ContentModule[] => {
      return mockContentModules;
    },
    
    getById: (moduleId: string): ContentModule | undefined => {
      return mockContentModules.find(module => module.moduleId === moduleId);
    },
    
    getFiltered: (goalTag?: string, channelTag?: string): ContentModule[] => {
      return mockContentModules.filter(module => {
        const matchesGoal = !goalTag || module.goalTags.includes(goalTag);
        const matchesChannel = !channelTag || module.channelTags.includes(channelTag);
        return matchesGoal && matchesChannel;
      });
    },
  },
  
  // Progress tracking functions
  userProgress: {
    updateProgress: (email: string, moduleId: string, percentComplete: number): User | null => {
      const user = db.users.getByEmail(email);
      if (!user) return null;
      
      const progress = user.progress || {};
      const isCompleted = percentComplete >= 100;
      
      // If this is the first time completing the module, award points
      const module = db.contentModules.getById(moduleId);
      let pointsToAdd = 0;
      
      if (module && isCompleted && (!progress[moduleId] || !progress[moduleId].completed)) {
        pointsToAdd = module.pointValue || 0;
      }
      
      // Update progress
      progress[moduleId] = {
        completed: isCompleted,
        lastAccessed: new Date(),
        percentComplete: Math.min(percentComplete, 100)
      };
      
      // Update user
      const updatedUser = {
        ...user,
        progress,
        points: (user.points || 0) + pointsToAdd
      };
      
      localStorage.setItem(`user_${email}`, JSON.stringify(updatedUser));
      return updatedUser;
    },
    
    getProgress: (email: string, moduleId?: string) => {
      const user = db.users.getByEmail(email);
      if (!user || !user.progress) {
        return moduleId ? null : {};
      }
      
      return moduleId ? user.progress[moduleId] || null : user.progress;
    }
  }
};

// Auth context type
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, displayName: string, password: string) => Promise<User>;
  logout: () => void;
}
