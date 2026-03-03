import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from '@/lib/navigation-compat';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GOLD_COLOR = "rgb(199, 158, 72)";

// Admin credentials from environment variables (secure) with fallback to hardcoded defaults
const getAdminAccounts = () => {
  const accounts = [];
  
  // Primary admin account
  if (import.meta.env.VITE_ADMIN_USERNAME && import.meta.env.VITE_ADMIN_PASSWORD) {
    accounts.push({
      username: import.meta.env.VITE_ADMIN_USERNAME,
      password: import.meta.env.VITE_ADMIN_PASSWORD,
      displayName: import.meta.env.VITE_ADMIN_DISPLAY_NAME || "Admin"
    });
  } else {
    // Fallback to default admin credentials
    accounts.push({
      username: "admin",
      password: "admin",
      displayName: "Admin"
    });
  }
  
  // Secondary admin account
  if (import.meta.env.VITE_ADMIN2_USERNAME && import.meta.env.VITE_ADMIN2_PASSWORD) {
    accounts.push({
      username: import.meta.env.VITE_ADMIN2_USERNAME,
      password: import.meta.env.VITE_ADMIN2_PASSWORD,
      displayName: import.meta.env.VITE_ADMIN2_DISPLAY_NAME || "Admin 2"
    });
  }
  
  return accounts;
};

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get the page user was trying to access before being redirected to login
  const from = (location.state as any)?.from || "/admin/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check credentials against all admin accounts from env vars
    const adminAccounts = getAdminAccounts();
    const account = adminAccounts.find(
      (acc) => acc.username === username && acc.password === password
    );

    if (account) {
      setTimeout(() => {
        localStorage.setItem("adminAuthenticated", "true");
        localStorage.setItem("adminUsername", account.displayName);
        setIsLoading(false);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        // Redirect to the page they were trying to access, or dashboard by default
        navigate(from, { replace: true });
      }, 1000);
    } else {
      setIsLoading(false);
      toast({
        title: "Authentication Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border border-gray-200">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${GOLD_COLOR}15` }}
              >
                <Sparkles className="w-8 h-8" style={{ color: GOLD_COLOR }} />
              </div>
            </div>
            <CardTitle className="text-3xl font-serif" style={{ color: "#1a1a1a" }}>
              Admin Portal
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to manage your flower shop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                  color: "white",
                }}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Admin Portal - Secure Access Only
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

