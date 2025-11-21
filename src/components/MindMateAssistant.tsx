import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, X } from "lucide-react";

export const MindMateAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating AI Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full bg-gradient-primary hover:shadow-glow shadow-elegant transition-all duration-300 hover:scale-110 group"
          size="icon"
        >
          <Bot className="h-8 w-8 text-white group-hover:animate-pulse" />
        </Button>
        
        {/* Pulsing ring effect */}
        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: '2s' }} />
      </div>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0 bg-background/95 backdrop-blur">
          <DialogHeader className="px-6 py-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">MindMate AI Assistant</DialogTitle>
                  <p className="text-sm text-muted-foreground">Your personal mental wellness companion</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          
          {/* Embedded Streamlit App */}
          <div className="flex-1 relative overflow-hidden">
            <iframe
              src="http://youthmentalwellnessai.streamlit.app/"
              className="w-full h-full border-0"
              title="MindMate AI Chat"
              allow="microphone; camera"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
            
            {/* Loading overlay in case iframe takes time to load */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur pointer-events-none opacity-0 transition-opacity duration-300">
              <Bot className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
