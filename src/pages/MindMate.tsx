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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated Tech Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="border-b border-primary/20 bg-gradient-to-r from-background/95 via-primary/5 to-background/95 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-4 flex-1">
              {/* Advanced Robot Avatar */}
              <div className="relative group">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: '8s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-accent" />
                </div>
                
                {/* Pulsing glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-primary blur-xl opacity-30 animate-pulse" />
                
                {/* Main avatar */}
                <Avatar className="h-16 w-16 border-4 border-primary/40 shadow-2xl relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:border-primary/60">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center relative overflow-hidden">
                    {/* Animated scan line */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
                    <Bot className="h-9 w-9 text-white relative z-10 group-hover:animate-bounce" />
                  </div>
                </Avatar>
                
                {/* Status indicators */}
                <div className="absolute -bottom-1 -right-1 flex gap-1">
                  <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse shadow-lg shadow-green-500/50" />
                </div>

                {/* Corner brackets for tech look */}
                <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-primary/40" />
                <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-primary/40" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-primary/40" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-primary/40" />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient flex items-center gap-2">
                  MindMate AI
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono">v2.0</span>
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                    <span>ONLINE</span>
                  </div>
                  <span className="text-primary/50">•</span>
                  <span className="text-primary/70">{messages.length} MSG</span>
                  <span className="text-primary/50">•</span>
                  <span className="text-primary/70">AI READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <ScrollArea className="h-[calc(100vh-250px)] pr-4" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-10">
              {/* Robot Boot Sequence */}
              <div className="relative">
                {/* Outer tech circles */}
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 rounded-full border border-accent/20 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                
                {/* Main robot container */}
                <div className="relative h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 flex items-center justify-center backdrop-blur-sm border-2 border-primary/30 shadow-2xl">
                  {/* Animated scan lines */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-pulse" style={{ animationDuration: '2s' }} />
                  </div>
                  
                  {/* Corner brackets */}
                  <div className="absolute -top-3 -left-3 w-6 h-6 border-l-2 border-t-2 border-primary animate-pulse" />
                  <div className="absolute -top-3 -right-3 w-6 h-6 border-r-2 border-t-2 border-primary animate-pulse" />
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 border-l-2 border-b-2 border-primary animate-pulse" />
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 border-r-2 border-b-2 border-primary animate-pulse" />
                  
                  {/* Robot icon */}
                  <Bot className="h-20 w-20 text-primary relative z-10 animate-bounce" style={{ animationDuration: '2s' }} />
                  
                  {/* Orbital dots */}
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
                  </div>
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent shadow-lg shadow-accent/50" />
                  </div>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-primary blur-3xl opacity-20 animate-pulse" />
              </div>

              <div className="space-y-4 max-w-xl">
                {/* Boot sequence text */}
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent font-mono">
                    SYSTEM INITIALIZED
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-sm font-mono text-primary/70">
                    <span className="animate-pulse">&gt;</span>
                    <span>MindMate AI v2.0 Ready</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground leading-relaxed px-4">
                  Advanced AI companion system online. Equipped with emotional intelligence protocols 
                  and evidence-based wellness strategies. Ready to provide 24/7 mental health support.
                </p>
                
                {/* Quick action chips with tech design */}
                <div className="flex flex-wrap gap-3 justify-center pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setInput("I'm feeling stressed today")}
                    className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 font-mono"
                  >
                    <span className="mr-2">😰</span>
                    STRESS_MODE
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setInput("Can you suggest a breathing exercise?")}
                    className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 font-mono"
                  >
                    <span className="mr-2">🧘</span>
                    BREATHE.EXE
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setInput("I need motivation")}
                    className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 font-mono"
                  >
                    <span className="mr-2">✨</span>
                    MOTIVATE.SYS
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
                <Avatar className="h-10 w-10 border-2 border-primary/30 relative">
                  <div className="h-full w-full rounded-full bg-gradient-primary flex items-center justify-center relative overflow-hidden">
                    {/* Processing animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" style={{ animationDuration: '1.5s' }} />
                    <Bot className="h-6 w-6 text-white relative z-10" />
                  </div>
                </Avatar>
                <div className="bg-gradient-to-br from-muted/80 to-muted/60 rounded-2xl px-5 py-3 backdrop-blur-sm border border-primary/30 relative overflow-hidden">
                  {/* Tech scan line */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
                  
                  {/* Robot typing indicator */}
                  <div className="flex items-center gap-2 relative z-10">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-primary/70 font-mono animate-pulse">PROCESSING</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area - Robot Terminal Style */}
        <div className="mt-6 relative">
          {/* Tech corner brackets */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-primary/40" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-primary/40" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-primary/40" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-primary/40" />
          
          <div className="p-4 border-2 border-primary/30 rounded-2xl bg-gradient-to-br from-background/90 via-primary/5 to-background/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Animated scan line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="flex gap-3 relative z-10">
              {/* Voice Input Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoiceInput}
                className={`flex-shrink-0 h-12 w-12 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/50' 
                    : 'border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20'
                }`}
              >
                {isListening && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                )}
                {isListening ? <MicOff className="h-5 w-5 relative z-10" /> : <Mic className="h-5 w-5 relative z-10" />}
              </Button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="◉ ENTER_MESSAGE.txt"
                  className="h-12 rounded-xl border-primary/30 focus:border-primary/50 bg-background/70 backdrop-blur-sm font-mono placeholder:text-muted-foreground/50 pr-16 shadow-inner"
                  disabled={isLoading}
                />
                {input && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="text-xs font-mono text-primary/50">{input.length}</span>
                    <div className="w-1 h-4 bg-primary animate-pulse" />
                  </div>
                )}
              </div>

              {/* Send Button */}
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 h-12 px-6 rounded-xl bg-gradient-primary hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Send className="h-5 w-5 relative z-10" />
              </Button>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between mt-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">▸</span>
                <span>Press ENTER to transmit</span>
                {recognitionRef.current && (
                  <>
                    <span className="text-primary/50">•</span>
                    <span>VOICE_INPUT available</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-primary/70">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>CONNECTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMate;
