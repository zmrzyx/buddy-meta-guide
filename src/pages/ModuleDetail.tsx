
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db, ContentModule } from "@/lib/database";
import { PageContainer } from "@/components/layout/PageContainer";
import { MarketingBuddy } from "@/components/ui/marketing-buddy";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Award, Circle, CircleCheck, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function ModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [module, setModule] = useState<ContentModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    
    if (!moduleId) {
      navigate("/roadmap");
      return;
    }
    
    const moduleData = db.contentModules.getById(moduleId);
    
    if (moduleData) {
      setModule(moduleData);
      
      // Load user progress for this module
      if (user.email) {
        const userProgress = db.userProgress.getProgress(user.email, moduleId);
        if (userProgress) {
          setProgress(userProgress.percentComplete);
          setIsCompleted(userProgress.completed);
        }
      }
    } else {
      navigate("/roadmap");
    }
    
    setIsLoading(false);
  }, [moduleId, user, navigate]);
  
  const getModuleTypeLabel = (type: string) => {
    switch (type) {
      case "Course": return "Course";
      case "Video": return "Video";
      case "AI_Prompt": return "AI Template";
      default: return type;
    }
  };
  
  const getModuleTypeColor = (type: string) => {
    switch (type) {
      case "Course": return "bg-blue-100 text-blue-800";
      case "Video": return "bg-purple-100 text-purple-800";
      case "AI_Prompt": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getBuddyMessage = () => {
    if (!module) return "";
    
    switch (module.type) {
      case "AI_Prompt":
        return `Great choice, ${user?.displayName || "there"}! This is a template you can use to generate ideas. 
        
In a full version of this app, I'd help you customize this and generate marketing content directly. For now, you can copy this prompt and use it with any AI tool like ChatGPT.`;
      
      case "Course":
        return `This step-by-step course will help you master ${module.title.toLowerCase()}. 
        
In the full app, you'd be able to access all lessons and track your progress as you complete each section.`;
      
      case "Video":
        return `Videos are a great way to learn! This tutorial shows you exactly how to implement what you're learning.
        
In the full app, you'd be able to watch the video right here and access additional resources.`;
      
      default:
        return `Let's explore this module together!`;
    }
  };
  
  const handleAskBuddy = () => {
    alert("This feature would connect to an AI in the full version of the app!");
  };
  
  const handleViewContent = () => {
    if (module?.sourceUrl) {
      window.open(module.sourceUrl, "_blank");
    } else {
      alert("Full content would be available in the complete version of the app!");
    }
  };
  
  const handleMarkProgress = (percent: number) => {
    if (!user?.email || !moduleId) return;
    
    const updatedUser = db.userProgress.updateProgress(user.email, moduleId, percent);
    if (updatedUser) {
      setProgress(percent);
      setIsCompleted(percent >= 100);
      
      if (percent === 100) {
        const pointsEarned = module?.pointValue || 0;
        toast({
          title: "Achievement Unlocked! 🏆",
          description: `You've completed "${module?.title}" and earned ${pointsEarned} points!`,
          duration: 5000,
        });
      } else {
        toast({
          title: "Progress Saved",
          description: `You're ${percent}% through this module. Keep going!`,
          duration: 3000,
        });
      }
    }
  };
  
  if (isLoading || !module) return null;
  
  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link to="/roadmap" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roadmap
          </Link>
        </div>
        
        <div className="mb-8">
          <MarketingBuddy message={getBuddyMessage()} />
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{module.title}</CardTitle>
                <CardDescription className="mt-2">{module.summary}</CardDescription>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Badge className={getModuleTypeColor(module.type)}>
                  {getModuleTypeLabel(module.type)}
                </Badge>
                {module.pointValue && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" /> {module.pointValue} points
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Your Progress</span>
                <span className="text-sm">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {module.type === "AI_Prompt" ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">Marketing Buddy Brainstorm Idea:</h3>
                  <div className="bg-gray-50 border rounded-md p-4 text-gray-700">
                    {module.promptTemplate}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Customize and ask Marketing Buddy:</h3>
                  <Textarea 
                    placeholder="Edit the prompt above to fit your specific business needs..."
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p>This {module.type.toLowerCase()} contains the complete guidance on {module.title.toLowerCase()}.</p>
                <p>In the full version of the app, you would see the complete content here.</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 pt-6">
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <Button 
                  key={percent}
                  variant={percent <= progress ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMarkProgress(percent)}
                >
                  {percent === 100 ? (
                    <CircleCheck className="h-4 w-4 mr-1" />
                  ) : (
                    <Circle className="h-4 w-4 mr-1" />
                  )}
                  {percent}%
                </Button>
              ))}
            </div>
            
            <div>
              {module.type === "AI_Prompt" ? (
                <Button 
                  className="buddy-gradient-bg hover:opacity-90"
                  onClick={handleAskBuddy}
                >
                  Ask Marketing Buddy
                </Button>
              ) : (
                <Button 
                  className="buddy-gradient-bg hover:opacity-90"
                  onClick={handleViewContent}
                >
                  View Full Content
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
