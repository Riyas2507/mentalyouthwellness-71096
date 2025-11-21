import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/ui/avatar";
import { Send, Mic, MicOff, Bot, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

const MindMate = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use MindMate AI.",
          variant: "destructive",
        });
        navigate("/auth");
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
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1));
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-primary blur-md opacity-50 animate-pulse" />
                <Avatar className="h-14 w-14 border-2 border-primary/30 shadow-lg relative">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background animate-pulse" />
              </div>

              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  MindMate AI
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Your AI Mental Wellness Companion
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <ScrollArea className="h-[calc(100vh-250px)] pr-4" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-10">
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

        {/* Input Area */}
        <div className="mt-6 p-4 border border-border/50 rounded-2xl bg-background/50 backdrop-blur-xl shadow-lg">
          <div className="flex gap-3">
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

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="flex-1 h-12 rounded-xl border-primary/30 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
              disabled={isLoading}
            />

            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 h-12 px-6 rounded-xl bg-gradient-primary hover:shadow-glow transition-all duration-300 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            Press Enter to send • {recognitionRef.current ? 'Click mic for voice input' : 'Voice input not available'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MindMate;
