import { useEffect } from "react";

const MindMate = () => {
  useEffect(() => {
    window.location.href = "http://youthmentalwellnessai.streamlit.app/";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-muted-foreground">Redirecting to MindMate AI...</p>
      </div>
    </div>
  );
};

export default MindMate;
