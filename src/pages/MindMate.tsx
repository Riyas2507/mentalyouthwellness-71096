import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const MindMate = () => {
  const handleOpenMindMate = () => {
    window.location.href = "http://youthmentalwellnessai.streamlit.app/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            MindMate AI
          </h1>
          <p className="text-muted-foreground">Your mental wellness companion</p>
        </div>
        <Button
          size="lg"
          onClick={handleOpenMindMate}
          className="text-lg px-8 py-6 h-auto"
        >
          Open MindMate AI
          <ExternalLink className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MindMate;
