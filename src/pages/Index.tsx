import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Module Access Portal</h1>
        <p className="text-xl text-muted-foreground">
          Sign in to access your learning modules
        </p>
        <Button onClick={() => navigate("/auth")} size="lg">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
