import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, LogOut, Brain, Heart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Unable to sign out. Please try again.",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/auth");
    }
  };

  const modules = [
    {
      id: 1,
      title: "MindMate 🤖",
      description: "Your personal AI companion for mental wellness. Share your thoughts, feelings, and concerns in a judgment-free space. Get personalized support and guidance whenever you need it.",
      url: "https://youthmentalwellnessai.streamlit.app/",
      icon: Brain,
      gradient: "from-teal-500 to-cyan-600",
      external: true,
    },
    {
      id: 2,
      title: "MindCheck 🧭",
      description: "Take a moment to understand your mental state. Complete our 20-question assessment to gain insights into your emotional wellbeing and track your progress over time.",
      url: "/mindcheck",
      icon: Heart,
      gradient: "from-rose-400 to-pink-500",
      external: false,
    },
    {
      id: 3,
      title: "Wellness Studio 🌿",
      description: "Find your inner peace with guided exercises. Explore yoga poses, meditation practices, and breathing techniques designed to reduce stress and improve your overall wellbeing.",
      url: "/wellness",
      icon: Sparkles,
      gradient: "from-emerald-500 to-green-600",
      external: false,
    },
    {
      id: 4,
      title: "BrainPlay 🎯",
      description: "Sharpen your mind through engaging activities. Challenge yourself with memory games and focus exercises that build cognitive strength while having fun.",
      url: "/brainplay",
      icon: Brain,
      gradient: "from-amber-500 to-orange-600",
      external: false,
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-accent">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/4 h-60 w-60 rounded-full bg-primary-glow/10 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-glow/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative p-8">
        <div className="mx-auto max-w-7xl animate-fade-in">
          <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Mental Youth Wellness
              </h1>
              <p className="text-lg text-muted-foreground">
                Welcome back, <span className="font-medium text-foreground">{user.email}</span>
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="border-2 hover:border-primary hover:text-primary transition-all duration-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Card 
                  key={module.id} 
                  className="group relative overflow-hidden shadow-elegant hover:shadow-glow transition-all duration-500 border-border/50 backdrop-blur animate-scale-in flex flex-col"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${module.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="mt-auto relative">
                    <Button
                      className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 group/btn"
                      onClick={() => {
                        if (module.url !== "#") {
                          if (module.external) {
                            window.open(module.url, "_blank", "noopener,noreferrer");
                          } else {
                            navigate(module.url);
                          }
                        }
                      }}
                      disabled={module.url === "#"}
                    >
                      {module.url === "#" ? "Coming Soon" : module.external ? "Access Module" : "Open Module"}
                      {module.url !== "#" && (
                        <ExternalLink className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
