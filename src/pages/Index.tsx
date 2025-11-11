import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-accent">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-glow/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-3xl mx-auto animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="h-12 w-12 text-primary animate-float" />
            <Heart className="h-10 w-10 text-primary-glow animate-float" style={{ animationDelay: "1s" }} />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Mental Youth Wellness
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Empowering young minds with accessible mental health resources and support
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg"
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-6 text-lg group"
            >
              Get Started
              <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            </Button>
            
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg border-2 hover:border-primary hover:text-primary transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
