
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db, ContentModule } from "@/lib/database";
import { PageContainer } from "@/components/layout/PageContainer";
import { MarketingBuddy } from "@/components/ui/marketing-buddy";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function Roadmap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<ContentModule[]>([]);
  
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
    
    setModules(filteredModules);
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
    
    return `Hi ${user.displayName}! Based on your goal of ${goalText} using ${channelText}, I've created a personalized roadmap just for you.

Tap on any module to get started, or click the microphone button to ask me a question!`;
  };
  
  if (!user) return null;
  
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <MarketingBuddy message={getBuddyMessage()} showVoiceTrigger={true} />
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Your Marketing Roadmap</h1>
        
        {modules.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p>No modules found matching your preferences. Please try updating your preferences.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module) => (
              <Card key={module.moduleId} className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <Badge className={getModuleTypeColor(module.type)}>
                      {getModuleTypeLabel(module.type)}
                    </Badge>
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
                    Explore <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
