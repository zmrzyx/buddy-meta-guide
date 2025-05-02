
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketingBuddyProps {
  message: string;
  showVoiceTrigger?: boolean;
}

export function MarketingBuddy({ message, showVoiceTrigger = false }: MarketingBuddyProps) {
  const handleVoiceTrigger = () => {
    alert("Voice interaction with Marketing Buddy coming soon!");
  };
  
  return (
    <div className="relative rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="h-10 w-10 rounded-full buddy-gradient-bg flex items-center justify-center text-white font-bold text-lg">
          MB
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-lg buddy-text-gradient mb-2">Marketing Buddy</h3>
          <div className="text-gray-700 whitespace-pre-line">{message}</div>
        </div>
        
        {showVoiceTrigger && (
          <Button 
            onClick={handleVoiceTrigger}
            className="buddy-gradient-bg hover:opacity-90 transition-opacity rounded-full h-12 w-12 flex items-center justify-center"
            size="icon"
            aria-label="Voice Interaction"
          >
            <Mic className="h-6 w-6 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
}
