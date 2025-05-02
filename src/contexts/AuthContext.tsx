
import React, { createContext, useState, useContext, useEffect } from "react";
import { db, User, AuthContextType } from "@/lib/database";
import { useToast } from "@/components/ui/use-toast";

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing user session
  useEffect(() => {
    const currentUserEmail = localStorage.getItem("currentUserEmail");
    if (currentUserEmail) {
      const userData = db.users.getByEmail(currentUserEmail);
      if (userData) {
        setUser(userData);
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    // In a real app, this would verify the password
    // For this prototype, we're just checking if the user exists
    const user = db.users.getByEmail(email);
    
    if (!user) {
      setIsLoading(false);
      toast({
        title: "Login failed",
        description: "User not found. Please check your email or sign up.",
        variant: "destructive"
      });
      throw new Error("User not found");
    }

    // Store current user email
    localStorage.setItem("currentUserEmail", email);
    setUser(user);
    setIsLoading(false);
    
    toast({
      title: "Login successful",
      description: `Welcome back, ${user.displayName}!`,
    });
    
    return user;
  };

  // Signup function
  const signup = async (email: string, displayName: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    // Check if user already exists
    const existingUser = db.users.getByEmail(email);
    if (existingUser) {
      setIsLoading(false);
      toast({
        title: "Signup failed",
        description: "This email is already registered. Please login instead.",
        variant: "destructive"
      });
      throw new Error("Email already registered");
    }

    // Create new user
    const newUser = db.users.create(email, displayName);
    
    // Store current user email
    localStorage.setItem("currentUserEmail", email);
    setUser(newUser);
    setIsLoading(false);
    
    toast({
      title: "Account created",
      description: `Welcome to Meta Marketing Navigator, ${displayName}!`,
    });
    
    return newUser;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("currentUserEmail");
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
