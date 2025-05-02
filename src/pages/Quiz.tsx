
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/database";
import { PageContainer } from "@/components/layout/PageContainer";
import { MarketingBuddy } from "@/components/ui/marketing-buddy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Quiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [marketingGoal, setMarketingGoal] = useState("");
  const [primaryChannel, setPrimaryChannel] = useState("");
  const [preferredFormat, setPreferredFormat] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    // Save user preferences
    db.users.update(user.email, {
      marketingGoal,
      primaryChannel,
      preferredFormat
    });
    
    // Navigate to roadmap
    navigate("/roadmap");
  };
  
  const buddyMessage = `Hi ${user?.displayName || "there"}! I'm your Marketing Buddy! 😊

Let me understand your goals better so I can create a personalized roadmap just for you. Don't worry, this will only take a minute!`;
  
  if (!user) {
    navigate("/");
    return null;
  }
  
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <MarketingBuddy message={buddyMessage} />
        </div>
        
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-medium mb-4">What's your main goal?</h2>
              <RadioGroup 
                value={marketingGoal} 
                onValueChange={setMarketingGoal}
                className="space-y-3"
                required
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="increase_sales" id="goal1" />
                  <Label htmlFor="goal1">Increase sales and get more customers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="brand_awareness" id="goal2" />
                  <Label htmlFor="goal2">Build brand awareness and recognition</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="increase_engagement" id="goal3" />
                  <Label htmlFor="goal3">Improve engagement with existing customers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="local_awareness" id="goal4" />
                  <Label htmlFor="goal4">Reach more local customers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="customer_service" id="goal5" />
                  <Label htmlFor="goal5">Provide better customer service</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h2 className="text-xl font-medium mb-4">Which platform do you want to focus on?</h2>
              <RadioGroup 
                value={primaryChannel} 
                onValueChange={setPrimaryChannel}
                className="space-y-3"
                required
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="facebook" id="channel1" />
                  <Label htmlFor="channel1">Facebook</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instagram" id="channel2" />
                  <Label htmlFor="channel2">Instagram</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whatsapp" id="channel3" />
                  <Label htmlFor="channel3">WhatsApp</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h2 className="text-xl font-medium mb-4">How do you prefer to learn?</h2>
              <RadioGroup 
                value={preferredFormat} 
                onValueChange={setPreferredFormat}
                className="space-y-3"
                required
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="step_by_step" id="format1" />
                  <Label htmlFor="format1">Step-by-step guides (courses)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="format2" />
                  <Label htmlFor="format2">Videos I can watch</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ai_assist" id="format3" />
                  <Label htmlFor="format3">AI-generated ideas and templates</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              type="submit" 
              className="w-full buddy-gradient-bg hover:opacity-90"
              disabled={!marketingGoal || !primaryChannel || !preferredFormat || isSubmitting}
            >
              Save & See My Roadmap
            </Button>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
}
