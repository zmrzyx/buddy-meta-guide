import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db, ContentModule } from "@/lib/database"; // Assuming UserProgress data structure comes from here implicitly
import { PageContainer } from "@/components/layout/PageContainer";
import { MarketingBuddy } from "@/components/ui/marketing-buddy";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, CircleCheck, Medal, Star, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Define the type for the progress data we want to store in the state
type ModuleProgressState = {
  completed: boolean;
  percentComplete: number;
};

export default function Roadmap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<ContentModule[]>([]);
  const [allModules, setAllModules] = useState<ContentModule[]>([]);
  // Use the ModuleProgressState type for the userProgress state
  const [userProgress, setUserProgress] = useState<{ [moduleId: string]: ModuleProgressState }>({});
  const [userPoints, setUserPoints] = useState(0);
  const [completedModules, setCompletedModules] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    // Redirect if personalization data is missing
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

    // --- CORRECTED PROGRESS HANDLING START ---
    if (user.email) {
      // 1. Fetch the raw data (might have extra fields or wrong structure)
      const rawProgressData = db.userProgress.getProgress(user.email);

      // 2. Prepare an empty object that WILL match our state's type perfectly
      const processedProgress: { [moduleId: string]: ModuleProgressState } = {};
      let completedCount = 0; // To safely count completed modules

      // 3. Check if the raw data looks like the map we expect
      if (rawProgressData && typeof rawProgressData === 'object' && !Array.isArray(rawProgressData) && !rawProgressData.hasOwnProperty('completed')) {
          // 4. Loop through the module IDs in the raw data map
          for (const moduleId in rawProgressData) {
              // Good practice: Ensure we're only looking at the object's own properties
              if (Object.prototype.hasOwnProperty.call(rawProgressData, moduleId)) {
                  const moduleData = rawProgressData[moduleId];

                  // 5. Validate the data for THIS specific module
                  if (moduleData && typeof moduleData === 'object' && 'completed' in moduleData && 'percentComplete' in moduleData) {
                      // 6. Create a NEW object with ONLY the fields needed for our state
                      processedProgress[moduleId] = {
                          completed: moduleData.completed,
                          percentComplete: moduleData.percentComplete,
                          // Notice: We are NOT including 'lastAccessed' here!
                      };
                      // 7. Increment count if this module is completed
                      if (moduleData.completed) {
                          completedCount++;
                      }
                  } else {
                     // Optional: Log if data for a specific module is bad
                     console.warn(`Skipping invalid progress data for moduleId: ${moduleId}`, moduleData);
                  }
              }
          }
      } else if (rawProgressData) {
          // Optional: Log if the overall structure of rawProgressData was unexpected
          console.warn("Received unexpected progress data format from db.userProgress.getProgress:", rawProgressData);
      }
      // If rawProgressData was null/undefined or the wrong structure, processedProgress will remain empty ({}) and completedCount will be 0.

      // 8. Update the state with the CLEANED and CORRECTLY TYPED data
      setUserProgress(processedProgress);
      setCompletedModules(completedCount); // Use the count calculated safely

      // Update user points (assuming user.points reflects total points correctly)
      setUserPoints(user.points || 0);

    } else {
      // If no user email, reset progress states
      setUserProgress({});
      setCompletedModules(0);
      setUserPoints(0); // Reset points too if appropriate
    }
    // --- CORRECTED PROGRESS HANDLING END ---

  }, [user, navigate]); // Dependencies for useEffect

  // Helper function to get module type label
  const getModuleTypeLabel = (type: string) => {
    switch (type) {
      case "Course": return "Course";
      case "Video": return "Video";
      case "AI_Prompt": return "AI Template";
      default: return type;
    }
  };

  // Helper function to get module type color class
  const getModuleTypeColor = (type: string) => {
    switch (type) {
      case "Course": return "bg-blue-100 text-blue-800";
      case "Video": return "bg-purple-100 text-purple-800";
      case "AI_Prompt": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Function to generate the Marketing Buddy message
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

    return `Hi ${user.displayName || 'there'}! Based on your goal of ${goalText} using ${channelText}, I've created a personalized roadmap just for you.

Tap on any module to get started, or click the microphone button to ask me a question!${progressMessage}`;
  };

  // Function to render a list of modules as cards
  const renderModulesList = (modulesList: ContentModule[]) => (
    <>
      {modulesList.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p>No modules found matching your preferences. Please try updating your preferences or check the Full Gallery.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modulesList.map((module) => {
            // Safely access progress using the module ID, default if not found
            const moduleProgress = userProgress[module.moduleId] || { completed: false, percentComplete: 0 };

            return (
              <Card key={module.moduleId} className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow pr-4"> {/* Added padding-right */}
                      <CardTitle className="text-lg flex items-center gap-2">
                        {moduleProgress.completed && (
                          <CircleCheck className="h-5 w-5 text-green-500 flex-shrink-0" /> // Added flex-shrink-0
                        )}
                        <span className="break-words">{module.title}</span> {/* Allow title to wrap */}
                      </CardTitle>

                      {moduleProgress.percentComplete > 0 && moduleProgress.percentComplete < 100 && (
                        <div className="mt-2">
                          <Progress value={moduleProgress.percentComplete} className="h-1" />
                          <p className="text-xs text-gray-500 mt-1">{moduleProgress.percentComplete}% complete</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
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
                  <p className="text-sm text-gray-600">{module.summary}</p> {/* Adjusted text size */}
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

  // Prevent rendering if user data isn't loaded yet
  if (!user) return null;

  // Main component render
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
                <div className="text-2xl font-bold flex items-center justify-center gap-1"> {/* Added justify-center */}
                  <Medal className="h-5 w-5 text-purple-600" />
                  {userPoints}
                </div>
                <div className="text-sm text-gray-600">Points</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center gap-1"> {/* Added justify-center */}
                  <Star className="h-5 w-5 text-amber-500" />
                  {completedModules}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="personalized" className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4"> {/* Added gap for spacing */}
            <h1 className="text-2xl font-bold text-center sm:text-left">Your Marketing Content</h1> {/* Centered on small screens */}
            <TabsList className="grid grid-cols-2 w-full sm:w-auto"> {/* Full width on small screens */}
              <TabsTrigger value="personalized" className="flex items-center justify-center gap-2"> {/* Added justify-center */}
                <BookOpen className="h-4 w-4" /> Personalized
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center justify-center gap-2"> {/* Added justify-center */}
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