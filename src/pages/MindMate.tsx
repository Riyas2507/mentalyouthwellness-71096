import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MindMate = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Button
          size="lg"
          onClick={() => window.open("http://youthmentalwellnessai.streamlit.app/", "_blank")}
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
