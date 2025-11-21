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
      title: "MindMate AI 🤖",
      description: "Your personal AI companion for mental wellness. Share your thoughts, feelings, and concerns in a judgment-free space. Get personalized support and guidance whenever you need it.",
      url: "/mindmate",
      icon: Brain,
      gradient: "from-teal-500 to-cyan-600",
      external: false,
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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent))_0%,transparent_50%)]" />

      <div className="relative p-6 md:p-12">
        <div className="mx-auto max-w-6xl animate-fade-in">
          <div className="mb-8 md:mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Mental Youth Wellness
              </h1>
              <p className="text-lg text-muted-foreground">
                Welcome back, <span className="font-medium text-foreground">{user.email}</span>
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="border-2 hover:bg-accent transition-colors"
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
                  className="group relative overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 border-2 flex flex-col animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="relative pb-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${module.gradient} text-white shadow-sm`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          {module.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 relative">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-medium"
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
                        <ExternalLink className="ml-2 h-4 w-4" />
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
