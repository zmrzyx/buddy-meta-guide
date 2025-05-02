
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db, ContentModule } from "@/lib/database";
import { PageContainer } from "@/components/layout/PageContainer";
import { MarketingBuddy } from "@/components/ui/marketing-buddy";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, CircleCheck, Medal, Star, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function Roadmap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<ContentModule[]>([]);
  const [allModules, setAllModules] = useState<ContentModule[]>([]);
  const [userProgress, setUserProgress] = useState<{[moduleId: string]: {completed: boolean, percentComplete: number}}>({});
  const [userPoints, setUserPoints] = useState(0);
  const [completedModules, setCompletedModules] = useState(0);
  
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    
    if (!user.marketingGoal || !user.primaryChannel) {
      navigate("/quiz");
      return;
    }
    
    // Fetch filtered modules based on user preferences
    const filteredModules = db.contentModules.getFiltered(
      user.marketingGoal,
      user.primaryChannel
    );
    
    // Fetch all modules for the gallery
    const allAvailableModules = db.contentModules.getAll();
    
    setModules(filteredModules);
    setAllModules(allAvailableModules);
    
    // Fetch user progress
    if (user.email) {
      const progress = db.userProgress.getProgress(user.email);
      setUserProgress(progress || {});
      setUserPoints(user.points || 0);
      
      // Count completed modules
      const completed = Object.values(progress || {}).filter(p => p.completed).length;
      setCompletedModules(completed);
    }
  }, [user, navigate]);
  
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
    if (!user) return "";
    
    const goalText = (() => {
      switch (user.marketingGoal) {
        case "increase_sales": return "increasing sales";
        case "brand_awareness": return "building brand awareness";
        case "increase_engagement": return "improving engagement";
        case "local_awareness": return "reaching local customers";
        case "customer_service": return "providing better customer service";
        default: return "your marketing goals";
      }
    })();
    
    const channelText = (() => {
      switch (user.primaryChannel) {
        case "facebook": return "Facebook";
        case "instagram": return "Instagram";
        case "whatsapp": return "WhatsApp";
        default: return "Meta platforms";
      }
    })();
    
    // Add progress information to the message
    let progressMessage = "";
    if (completedModules > 0) {
      progressMessage = `\n\nAwesome job! You've completed ${completedModules} module${completedModules > 1 ? 's' : ''} and earned ${userPoints} points so far. Keep it up!`;
    }
    
    return `Hi ${user.displayName}! Based on your goal of ${goalText} using ${channelText}, I've created a personalized roadmap just for you.

Tap on any module to get started, or click the microphone button to ask me a question!${progressMessage}`;
  };
  
  const renderModulesList = (modulesList: ContentModule[]) => (
    <>
      {modulesList.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p>No modules found matching your preferences. Please try updating your preferences.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modulesList.map((module) => {
            const moduleProgress = userProgress[module.moduleId] || { completed: false, percentComplete: 0 };
            
            return (
              <Card key={module.moduleId} className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {moduleProgress.completed && (
                          <CircleCheck className="h-5 w-5 text-green-500" />
                        )}
                        {module.title}
                      </CardTitle>
                      
                      {moduleProgress.percentComplete > 0 && moduleProgress.percentComplete < 100 && (
                        <div className="mt-2">
                          <Progress value={moduleProgress.percentComplete} className="h-1" />
                          <p className="text-xs text-gray-500 mt-1">{moduleProgress.percentComplete}% complete</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getModuleTypeColor(module.type)}>
                        {getModuleTypeLabel(module.type)}
                      </Badge>
                      {module.pointValue && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> {module.pointValue}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 flex-grow">
                  <p className="text-gray-600">{module.summary}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link 
                    to={`/module/${module.moduleId}`}
                    className="inline-flex items-center text-buddy-blue font-medium hover:underline"
                  >
                    {moduleProgress.completed ? 'Review Again' : 'Explore'} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
  
  if (!user) return null;
  
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <MarketingBuddy message={getBuddyMessage()} showVoiceTrigger={true} />
        </div>
        
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" /> Your Learning Journey
              </h2>
              <p className="text-gray-600">Track your progress and earn rewards</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center gap-1">
                  <Medal className="h-5 w-5 text-purple-600" />
                  {userPoints}
                </div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center gap-1">
                  <Star className="h-5 w-5 text-amber-500" />
                  {completedModules}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="personalized" className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Your Marketing Content</h1>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="personalized" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Personalized
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Full Gallery
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="personalized">
            <h2 className="text-xl font-semibold mb-4">Your Personalized Roadmap</h2>
            {renderModulesList(modules)}
          </TabsContent>
          
          <TabsContent value="all">
            <h2 className="text-xl font-semibold mb-4">Complete Course Gallery</h2>
            {renderModulesList(allModules)}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
