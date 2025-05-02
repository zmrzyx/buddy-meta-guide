
import { useState } from "react";
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateGeminiResponse } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

interface MarketingBuddyProps {
  message: string;
  showVoiceTrigger?: boolean;
}

export function MarketingBuddy({ message, showVoiceTrigger = false }: MarketingBuddyProps) {
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gemini_api_key') || '';
    }
    return '';
  });
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [isApiKeyEntered, setIsApiKeyEntered] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('gemini_api_key');
    }
    return false;
  });
  const { toast } = useToast();

  const handleVoiceTrigger = () => {
    alert("Voice interaction with Marketing Buddy coming soon!");
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Gemini API key",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem('gemini_api_key', apiKey);
    setIsApiKeyEntered(true);
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved",
    });
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const messages = [
      {
        role: "system" as const,
        content: "You are Marketing Buddy, a friendly AI assistant who helps small business owners with Meta marketing (Facebook, Instagram, WhatsApp). Be friendly, casual, and helpful. Avoid technical jargon. Keep responses concise and actionable."
      },
      {
        role: "user" as const,
        content: userMessage
      }
    ];

    try {
      const result = await generateGeminiResponse(apiKey, messages);
      setResponse(result.text);
      
      if (result.error) {
        toast({
          title: "Error",
          description: "There was a problem generating a response. Check your API key.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to communicate with Gemini API.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="h-10 w-10 rounded-full buddy-gradient-bg flex items-center justify-center text-white font-bold text-lg">
          MB
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-lg buddy-text-gradient mb-2">Marketing Buddy</h3>
          <div className="text-gray-700 whitespace-pre-line">{response || message}</div>
          
          {!isApiKeyEntered ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                To enable interactive Marketing Buddy, please enter your Gemini API key:
              </p>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your Gemini API key here"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button onClick={handleSaveApiKey} className="buddy-gradient-bg hover:opacity-90">
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get a free API key from <a href="https://aistudio.google.com/app/apikey" className="underline" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <Textarea 
                placeholder="Ask Marketing Buddy a question..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-between items-center">
                <Button
                  onClick={() => {
                    localStorage.removeItem('gemini_api_key');
                    setIsApiKeyEntered(false);
                    setApiKey('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Reset API Key
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  className="buddy-gradient-bg hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? "Thinking..." : "Send"} 
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
