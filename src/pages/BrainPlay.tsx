import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BrainPlay = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeGame, setActiveGame] = useState<"memory" | "breathing" | null>(null);

  // Memory Grid Game State
  const [gridSize] = useState(4);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);

  // Breathing Game State
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "exhale">("inhale");
  const [breathingActive, setBreathingActive] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Memory Grid Game Functions
  const startMemoryGame = () => {
    const newPattern: number[] = [];
    const patternLength = Math.min(5 + Math.floor(score / 3), 12);
    for (let i = 0; i < patternLength; i++) {
      newPattern.push(Math.floor(Math.random() * (gridSize * gridSize)));
    }
    setPattern(newPattern);
    setUserPattern([]);
    setIsShowing(true);
    setGameStarted(true);

    setTimeout(() => {
      setIsShowing(false);
    }, 2000);
  };

  const handleCellClick = (index: number) => {
    if (isShowing || !gameStarted) return;

    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    if (!pattern.includes(index)) {
      toast({
        variant: "destructive",
        title: "Game Over!",
        description: `Your score: ${score}`,
      });
      setGameStarted(false);
      setScore(0);
      return;
    }

    if (newUserPattern.length === pattern.length) {
      const correct = pattern.every((cell) => newUserPattern.includes(cell));
      if (correct) {
        setScore(score + 1);
        toast({
          title: "Success!",
          description: "Great memory! Starting next round...",
        });
        setTimeout(() => startMemoryGame(), 1000);
      } else {
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `Your score: ${score}`,
        });
        setGameStarted(false);
        setScore(0);
      }
    }
  };

  // Breathing Game Functions
  const startBreathing = () => {
    setBreathingActive(true);
    const interval = setInterval(() => {
      setBreathingPhase((prev) => (prev === "inhale" ? "exhale" : "inhale"));
    }, 4000);

    return () => clearInterval(interval);
  };

  const stopBreathing = () => {
    setBreathingActive(false);
    setBreathingPhase("inhale");
  };

  useEffect(() => {
    if (breathingActive) {
      const cleanup = startBreathing();
      return cleanup;
    }
  }, [breathingActive]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-accent">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/4 h-60 w-60 rounded-full bg-primary-glow/10 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-glow/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative p-8">
        <div className="mx-auto max-w-7xl animate-fade-in">
          <div className="mb-12 flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-2 hover:border-primary hover:text-primary transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                BrainPlay🎯
              </h1>
              <p className="text-lg text-muted-foreground">
                Sharpen your mind with fun games
              </p>
            </div>
          </div>

          {!activeGame && (
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="group relative overflow-hidden shadow-elegant hover:shadow-glow transition-all duration-500 border-border/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-2xl">Memory Grid</CardTitle>
                  <CardDescription>
                    Improve short-term memory & concentration by remembering the pattern
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setActiveGame("memory")}
                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Play Memory Grid
                  </Button>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden shadow-elegant hover:shadow-glow transition-all duration-500 border-border/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-2xl">Breathing & Focus Trainer</CardTitle>
                  <CardDescription>
                    Build attention & mindfulness through guided breathing exercises
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setActiveGame("breathing")}
                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Breathing Exercise
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeGame === "memory" && (
            <Card className="shadow-elegant backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl">Memory Grid</CardTitle>
                  <Button variant="outline" onClick={() => setActiveGame(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
                <CardDescription className="text-lg">
                  {gameStarted ? (isShowing ? "Memorize the pattern!" : "Click the lit squares!") : "Click Start to begin"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">Score: {score}</div>
                  <Button
                    onClick={startMemoryGame}
                    disabled={gameStarted && isShowing}
                    className="bg-gradient-primary"
                  >
                    {gameStarted ? <RotateCcw className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {gameStarted ? "Reset" : "Start"}
                  </Button>
                </div>
                <div
                  className="grid gap-2 mx-auto max-w-md"
                  style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                >
                  {Array.from({ length: gridSize * gridSize }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      className={`aspect-square rounded-lg transition-all duration-300 ${
                        isShowing && pattern.includes(index)
                          ? "bg-primary scale-95"
                          : userPattern.includes(index)
                          ? "bg-primary/50"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      disabled={isShowing || !gameStarted}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeGame === "breathing" && (
            <Card className="shadow-elegant backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl">Breathing & Focus Trainer</CardTitle>
                  <Button variant="outline" onClick={() => setActiveGame(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
                <CardDescription className="text-lg">
                  Follow the circle to practice mindful breathing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex justify-center">
                  <Button
                    onClick={() => setBreathingActive(!breathingActive)}
                    className="bg-gradient-primary"
                    size="lg"
                  >
                    {breathingActive ? "Stop" : "Start"} Exercise
                  </Button>
                </div>
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
                  <div
                    className={`rounded-full bg-gradient-primary transition-all duration-[4000ms] ease-in-out ${
                      breathingActive
                        ? breathingPhase === "inhale"
                          ? "w-64 h-64"
                          : "w-32 h-32"
                        : "w-48 h-48"
                    }`}
                  />
                  <div className="text-3xl font-bold text-center">
                    {breathingActive ? (
                      breathingPhase === "inhale" ? (
                        "Breathe In"
                      ) : (
                        "Breathe Out"
                      )
                    ) : (
                      "Click Start to Begin"
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrainPlay;
