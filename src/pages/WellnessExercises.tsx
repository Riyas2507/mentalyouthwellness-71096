import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Brain, Activity, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import backPainImage from "@/assets/yoga-back-pain.jpg";
import kneePainImage from "@/assets/yoga-knee-exercise.jpg";
import headacheImage from "@/assets/headache-relief.jpg";
import meditationImage from "@/assets/meditation.jpg";
import breathingImage from "@/assets/breathing-exercise.jpg";
import stressImage from "@/assets/stress-relief.jpg";

interface Exercise {
  id: string;
  title: string;
  category: string;
  problem: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  image: string;
  description: string;
  benefits: string[];
  steps: string[];
  precautions: string[];
  icon: any;
}

const exercises: Exercise[] = [
  {
    id: "1",
    title: "Child's Pose (Balasana)",
    category: "Yoga",
    problem: "Back Pain",
    duration: "5-10 minutes",
    difficulty: "Beginner",
    image: backPainImage,
    icon: Activity,
    description: "A gentle resting pose that stretches the lower back and relieves tension in the spine.",
    benefits: [
      "Relieves back and neck pain",
      "Gently stretches hips, thighs, and ankles",
      "Calms the mind and reduces stress",
      "Improves digestion"
    ],
    steps: [
      "Start on your hands and knees in a tabletop position",
      "Bring your big toes together and spread your knees wide apart",
      "Sit back on your heels and extend your arms forward",
      "Rest your forehead on the mat and relax your shoulders",
      "Hold for 5-10 minutes, breathing deeply"
    ],
    precautions: [
      "Avoid if you have knee injuries",
      "Use a cushion under your forehead if needed",
      "Pregnant women should widen knees to accommodate belly"
    ]
  },
  {
    id: "2",
    title: "Chair Pose (Utkatasana)",
    category: "Yoga",
    problem: "Knee Strengthening",
    duration: "30 seconds - 1 minute",
    difficulty: "Intermediate",
    image: kneePainImage,
    icon: Activity,
    description: "A powerful standing pose that strengthens the knees, thighs, and ankles while improving balance.",
    benefits: [
      "Strengthens thighs, calves, and ankles",
      "Improves knee stability",
      "Tones the core muscles",
      "Builds mental endurance"
    ],
    steps: [
      "Stand with feet hip-width apart",
      "Raise your arms overhead, palms facing each other",
      "Bend your knees and lower your hips as if sitting in a chair",
      "Keep your weight in your heels",
      "Hold for 30 seconds to 1 minute, breathing steadily",
      "Release and repeat 3-5 times"
    ],
    precautions: [
      "Avoid if you have severe knee injuries",
      "Don't let knees extend past toes",
      "Keep your back straight throughout"
    ]
  },
  {
    id: "3",
    title: "Neck Stretches",
    category: "Therapy",
    problem: "Headache Relief",
    duration: "5-10 minutes",
    difficulty: "Beginner",
    image: headacheImage,
    icon: Brain,
    description: "Gentle neck stretches that release tension and help alleviate headaches caused by stress and poor posture.",
    benefits: [
      "Reduces tension headaches",
      "Releases neck and shoulder tension",
      "Improves posture",
      "Increases blood flow to the head"
    ],
    steps: [
      "Sit or stand with shoulders relaxed",
      "Slowly tilt your head to the right, bringing ear toward shoulder",
      "Hold for 15-30 seconds",
      "Return to center and repeat on the left side",
      "Gently roll your head in a circular motion",
      "Repeat the sequence 3-5 times"
    ],
    precautions: [
      "Move slowly and gently",
      "Stop if you feel sharp pain",
      "Avoid if you have neck injuries without consulting a doctor"
    ]
  },
  {
    id: "4",
    title: "Mindfulness Meditation",
    category: "Meditation",
    problem: "Mental Wellness",
    duration: "10-20 minutes",
    difficulty: "Beginner",
    image: meditationImage,
    icon: Brain,
    description: "A practice of focused awareness that reduces stress, anxiety, and promotes overall mental well-being.",
    benefits: [
      "Reduces stress and anxiety",
      "Improves focus and concentration",
      "Enhances emotional health",
      "Promotes better sleep",
      "Increases self-awareness"
    ],
    steps: [
      "Find a quiet, comfortable place to sit",
      "Close your eyes or maintain a soft gaze",
      "Focus on your breath, noticing each inhale and exhale",
      "When thoughts arise, acknowledge them without judgment",
      "Gently return your focus to your breath",
      "Continue for 10-20 minutes",
      "Slowly open your eyes and notice how you feel"
    ],
    precautions: [
      "Start with shorter sessions if you're new",
      "It's normal for the mind to wander",
      "Be patient and kind with yourself"
    ]
  },
  {
    id: "5",
    title: "Deep Breathing (Pranayama)",
    category: "Breathing Exercise",
    problem: "Anxiety & Stress",
    duration: "5-15 minutes",
    difficulty: "Beginner",
    image: breathingImage,
    icon: Heart,
    description: "Controlled breathing techniques that calm the nervous system and reduce anxiety and stress.",
    benefits: [
      "Reduces stress and anxiety",
      "Lowers blood pressure",
      "Improves lung capacity",
      "Enhances mental clarity",
      "Promotes relaxation"
    ],
    steps: [
      "Sit comfortably with a straight spine",
      "Close your eyes and relax your shoulders",
      "Inhale slowly through your nose for a count of 4",
      "Hold your breath for a count of 4",
      "Exhale slowly through your mouth for a count of 6",
      "Repeat for 5-15 minutes",
      "Notice the calming effect on your body and mind"
    ],
    precautions: [
      "Don't strain or force your breath",
      "Stop if you feel dizzy",
      "Practice on an empty or light stomach"
    ]
  },
  {
    id: "6",
    title: "Gentle Stretching Flow",
    category: "Exercise",
    problem: "Overall Stress Relief",
    duration: "15-20 minutes",
    difficulty: "Beginner",
    image: stressImage,
    icon: Sparkles,
    description: "A series of gentle stretches that release physical tension and promote mental relaxation.",
    benefits: [
      "Releases muscle tension",
      "Improves flexibility",
      "Reduces stress hormones",
      "Increases energy levels",
      "Promotes better sleep"
    ],
    steps: [
      "Start with gentle neck rolls and shoulder shrugs",
      "Move to arm circles and wrist rotations",
      "Perform gentle side bends and torso twists",
      "Do forward folds and cat-cow stretches",
      "Include hip openers and leg stretches",
      "End with a final relaxation pose",
      "Breathe deeply throughout"
    ],
    precautions: [
      "Never bounce while stretching",
      "Stretch to mild tension, not pain",
      "Warm up before deeper stretches"
    ]
  }
];

const WellnessExercises = () => {
  const navigate = useNavigate();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const categories = ["All", "Yoga", "Therapy", "Meditation", "Breathing Exercise", "Exercise"];
  const problems = ["All", "Back Pain", "Knee Strengthening", "Headache Relief", "Mental Wellness", "Anxiety & Stress", "Overall Stress Relief"];

  const filteredExercises = exercises.filter(exercise => 
    filter === "All" || exercise.category === filter || exercise.problem === filter
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "Intermediate": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "Advanced": return "bg-red-500/10 text-red-700 dark:text-red-400";
      default: return "";
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-accent">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/4 h-60 w-60 rounded-full bg-primary-glow/10 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-glow/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="mb-4 hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Wellness Exercises & Therapies
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Discover yoga poses, exercises, and therapies for various physical and mental health concerns. 
                Each practice includes detailed instructions, benefits, and safety precautions.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-2 justify-center animate-fade-in">
            {[...categories, ...problems.filter(p => p !== "All")].map((category, index) => (
              <Badge
                key={category}
                variant={filter === category ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 ${
                  filter === category ? "bg-gradient-primary shadow-glow" : "hover:border-primary"
                }`}
                onClick={() => setFilter(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Exercise Cards Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise, index) => {
              const Icon = exercise.icon;
              return (
                <Card
                  key={exercise.id}
                  className="group cursor-pointer overflow-hidden shadow-elegant hover:shadow-glow transition-all duration-500 border-border/50 backdrop-blur animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedExercise(exercise)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={exercise.image}
                      alt={exercise.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 rounded-lg bg-gradient-primary text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {exercise.title}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="text-sm font-medium text-primary">{exercise.problem}</div>
                      <div className="text-sm">{exercise.category} • {exercise.duration}</div>
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {exercise.description}
                    </p>
                    <Button 
                      className="w-full mt-4 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedExercise && (
            <>
              <div className="relative h-64 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-lg">
                <img
                  src={selectedExercise.image}
                  alt={selectedExercise.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className={`absolute top-4 right-4 ${getDifficultyColor(selectedExercise.difficulty)}`}>
                  {selectedExercise.difficulty}
                </Badge>
              </div>

              <DialogHeader>
                <DialogTitle className="text-3xl bg-gradient-primary bg-clip-text text-transparent">
                  {selectedExercise.title}
                </DialogTitle>
                <DialogDescription className="space-y-1 text-base">
                  <div className="flex items-center gap-4 text-foreground">
                    <span className="font-medium text-primary">{selectedExercise.problem}</span>
                    <span>•</span>
                    <span>{selectedExercise.category}</span>
                    <span>•</span>
                    <span>{selectedExercise.duration}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground">{selectedExercise.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Benefits</h3>
                  <ul className="space-y-2">
                    {selectedExercise.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-primary-glow mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Step-by-Step Instructions</h3>
                  <ol className="space-y-3">
                    {selectedExercise.steps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-destructive flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Precautions
                  </h3>
                  <ul className="space-y-2">
                    {selectedExercise.precautions.map((precaution, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-destructive mt-1">•</span>
                        <span>{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WellnessExercises;
