import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const questions = [
  "I often feel stressed or overwhelmed by my daily responsibilities.",
  "I have trouble sleeping or experience changes in my sleep patterns.",
  "I feel sad, down, or hopeless most of the time.",
  "I have lost interest in activities I used to enjoy.",
  "I feel anxious or worried frequently.",
  "I have difficulty concentrating or making decisions.",
  "I experience physical symptoms like headaches or stomach aches without a clear cause.",
  "I feel irritable or have a short temper.",
  "I withdraw from friends, family, or social activities.",
  "I have thoughts of harming myself or others.",
  "I feel tired or lack energy most days.",
  "I have experienced significant changes in my appetite or weight.",
  "I feel guilty or worthless.",
  "I have difficulty managing my emotions.",
  "I use substances (alcohol, drugs) to cope with my feelings.",
  "I have experienced trauma or stressful life events recently.",
  "I feel like I can't control my worries.",
  "I have panic attacks or sudden intense fear.",
  "I struggle with self-esteem or body image issues.",
  "I feel disconnected from reality or myself."
];

const options = ["Always", "Often", "Sometimes", "Never"];
const optionScores = { Always: 3, Often: 2, Sometimes: 1, Never: 0 };

const MindCheck = () => {
  const [user, setUser] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    return answers.reduce((total, answer) => {
      return total + (optionScores[answer as keyof typeof optionScores] || 0);
    }, 0);
  };

  const getResultMessage = (score: number) => {
    if (score >= 0 && score <= 15) {
      return {
        title: "Minimal Mental Health Concerns",
        emoji: "😊",
        description: "You appear to be managing well emotionally and mentally. Continue practicing self-care and maintaining healthy habits.",
        color: "text-emerald-600",
        showMindMate: false
      };
    } else if (score >= 16 && score <= 30) {
      return {
        title: "Mild Mental Health Concerns",
        emoji: "😐",
        description: "You may be experiencing some stress or emotional difficulties. Consider talking to someone you trust or exploring relaxation techniques.",
        color: "text-yellow-600",
        showMindMate: true
      };
    } else if (score >= 31 && score <= 45) {
      return {
        title: "Moderate Mental Health Concerns",
        emoji: "😟",
        description: "Your responses suggest you may benefit from professional support. Consider reaching out to a counselor or therapist.",
        color: "text-orange-600",
        showMindMate: true
      };
    } else {
      return {
        title: "Significant Mental Health Concerns",
        emoji: "😢",
        description: "Your responses indicate you may be experiencing significant mental health challenges. Please seek professional help from a mental health provider as soon as possible.",
        color: "text-red-600",
        showMindMate: true
      };
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  const getChartData = () => {
    const counts = { Always: 0, Often: 0, Sometimes: 0, Never: 0 };
    answers.forEach(answer => {
      if (answer in counts) {
        counts[answer as keyof typeof counts]++;
      }
    });
    
    return [
      { name: "Always", count: counts.Always, color: "hsl(var(--destructive))" },
      { name: "Often", count: counts.Often, color: "hsl(var(--chart-4))" },
      { name: "Sometimes", count: counts.Sometimes, color: "hsl(var(--chart-2))" },
      { name: "Never", count: counts.Never, color: "hsl(var(--primary))" },
    ];
  };

  if (!user) {
    return null;
  }

  const score = calculateScore();
  const result = getResultMessage(score);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-accent">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/4 h-60 w-60 rounded-full bg-primary-glow/10 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-glow/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative p-8">
        <div className="mx-auto max-w-3xl animate-fade-in">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="mb-8 border-2 hover:border-primary hover:text-primary transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          {!showResults ? (
            <Card className="shadow-elegant border-border/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-3xl">Mental Health Check</CardTitle>
                <CardDescription className="text-base">
                  Question {currentQuestion + 1} of {questions.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-xl font-medium text-foreground">
                  {currentQuestion + 1}. {questions[currentQuestion]}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {options.map((option) => (
                    <Button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className="h-14 text-lg bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 transition-all duration-300 hover:shadow-glow"
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                <div className="mt-6 w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-elegant border-border/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="text-3xl text-center">Quiz Complete!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Response Distribution Chart */}
                <div className="p-6 rounded-lg bg-muted/50 space-y-4">
                  <h3 className="text-xl font-bold text-foreground">
                    Your Response Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--foreground))"
                        tick={{ fill: "hsl(var(--foreground))" }}
                      />
                      <YAxis 
                        stroke="hsl(var(--foreground))"
                        tick={{ fill: "hsl(var(--foreground))" }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                          color: "hsl(var(--foreground))"
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-6xl">{result.emoji}</p>
                  <p className="text-5xl font-bold text-primary">{score}</p>
                  <p className="text-lg text-muted-foreground">out of 60 points</p>
                </div>

                <div className="p-6 rounded-lg bg-muted/50 space-y-3">
                  <h3 className={`text-2xl font-bold ${result.color}`}>
                    {result.title}
                  </h3>
                  <p className="text-base text-foreground leading-relaxed">
                    {result.description}
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <p className="text-sm text-muted-foreground italic">
                    * This assessment is not a diagnostic tool. If you're concerned about your mental health, please consult with a qualified healthcare professional.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-4">
                      <Button
                        onClick={resetQuiz}
                        variant="outline"
                        className="flex-1 border-2 hover:border-primary hover:text-primary transition-all duration-300"
                      >
                        Take Quiz Again
                      </Button>
                      <Button
                        onClick={() => navigate("/dashboard")}
                        variant="outline"
                        className="flex-1 border-2 hover:border-primary hover:text-primary transition-all duration-300"
                      >
                        Back to Dashboard
                      </Button>
                    </div>
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

export default MindCheck;
