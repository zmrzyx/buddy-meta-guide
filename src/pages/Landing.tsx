
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const user = await login(email, password);
        // Check if user has completed onboarding
        if (user.marketingGoal && user.primaryChannel) {
          navigate("/roadmap");
        } else {
          navigate("/quiz");
        }
      } else {
        const user = await signup(email, displayName, password);
        navigate("/quiz");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: `${isLogin ? "Login" : "Signup"} failed`,
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-buddy-light">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold buddy-text-gradient mb-4">Meta Marketing Navigator</h1>
          <p className="text-gray-600">Your friendly guide to Meta marketing success</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Welcome Back!" : "Create an Account"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Sign in to continue your marketing journey" 
                : "Join us and start growing your business on Meta platforms"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Your Name</Label>
                  <Input 
                    id="displayName" 
                    placeholder="How should we call you?" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full buddy-gradient-bg hover:opacity-90"
                disabled={isSubmitting}
              >
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
              <Button 
                type="button" 
                variant="link" 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-sm"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
