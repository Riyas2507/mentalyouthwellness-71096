import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Bot, X, Send, Mic, MicOff, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/ui/avatar";

type Message = { role: "user" | "assistant"; content: string };

export const MindMateAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Could not capture voice input. Please try again.",
          variant: "destructive",
        });
      };
    }
  }, [toast]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsSpeaking(true);

    try {
      // Get the user's session token
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use MindMate AI.",
          variant: "destructive",
        });
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        setIsSpeaking(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mindmate-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantMessage;
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
      setIsSpeaking(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1));
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Robot Button with Advanced Animation */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Outer pulsing rings */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
          
          {/* Main button with gradient */}
          <Button
            onClick={() => setIsOpen(true)}
            className="h-20 w-20 rounded-full bg-gradient-to-br from-primary via-primary/90 to-accent hover:shadow-glow shadow-elegant transition-all duration-300 hover:scale-110 group relative z-10 border-2 border-primary/20"
            size="icon"
          >
            {/* Robot Icon with glow effect */}
            <div className="relative">
              <Bot className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
              {isSpeaking && (
                <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
              )}
            </div>
          </Button>

          {/* Active indicator when dialog is open */}
          {isOpen && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-background animate-pulse" />
          )}
        </div>
      </div>

      {/* AI Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0 bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-xl border-2 border-primary/20 shadow-2xl">
          {/* Header with Futuristic Design */}
          <div className="relative px-6 py-5 border-b border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,120,255,0.3),transparent_50%)]" />
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* AI Avatar with animations */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-primary blur-md opacity-50 animate-pulse" />
                  <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-lg relative">
                    <div className="h-full w-full rounded-full bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center">
                      <Bot className={`h-9 w-9 text-white ${isSpeaking ? 'animate-pulse' : ''}`} />
                    </div>
                  </Avatar>
                  {/* Status indicators */}
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                    MindMate AI
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Your AI Mental Wellness Companion
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-accent/50 rounded-full h-10 w-10 transition-all duration-300 hover:rotate-90"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Chat Area with Glassmorphism */}
          <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-transparent to-primary/5" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-10">
                {/* Welcome Animation */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-primary blur-2xl opacity-20 animate-pulse" />
                  <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/30">
                    <Bot className="h-16 w-16 text-primary animate-bounce" style={{ animationDuration: '2s' }} />
                  </div>
                </div>

                <div className="space-y-3 max-w-xl">
                  <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Hello! I'm MindMate AI
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    I'm your personal AI companion dedicated to supporting your mental wellness journey. 
                    Whether you need someone to talk to, coping strategies, or just want to explore 
                    mindfulness techniques - I'm here for you, 24/7.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setInput("I'm feeling stressed today")}
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      😰 Feeling stressed
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setInput("Can you suggest a breathing exercise?")}
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      🧘 Breathing exercise
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setInput("I need motivation")}
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      ✨ Need motivation
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-primary/30">
                      <div className="h-full w-full rounded-full bg-gradient-primary flex items-center justify-center">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-2xl px-5 py-3 max-w-[75%] shadow-lg backdrop-blur-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-primary to-primary/90 text-white border border-primary/20"
                        : "bg-gradient-to-br from-muted/80 to-muted/60 text-foreground border border-border/50"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-accent/30">
                      <div className="h-full w-full rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">You</span>
                      </div>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Avatar className="h-10 w-10 border-2 border-primary/30">
                    <div className="h-full w-full rounded-full bg-gradient-primary flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white animate-pulse" />
                    </div>
                  </Avatar>
                  <div className="bg-gradient-to-br from-muted/80 to-muted/60 rounded-2xl px-5 py-3 backdrop-blur-sm border border-border/50">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area with Futuristic Design */}
          <div className="p-5 border-t border-primary/20 bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-xl">
            <div className="flex gap-3">
              {/* Voice Input Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoiceInput}
                className={`flex-shrink-0 h-12 w-12 rounded-xl transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-500 animate-pulse' 
                    : 'border-primary/30 hover:bg-primary/10 hover:border-primary/50'
                }`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              {/* Text Input */}
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="flex-1 h-12 rounded-xl border-primary/30 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
                disabled={isLoading}
              />

              {/* Send Button */}
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 h-12 px-6 rounded-xl bg-gradient-primary hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {/* Quick Tips */}
            <p className="text-xs text-muted-foreground text-center mt-3">
              Press Enter to send • {recognitionRef.current ? 'Click mic for voice input' : 'Voice input not available'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
