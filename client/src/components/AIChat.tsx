import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ChatMessage as ChatMessageType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { X, Send, MessageCircle, Zap, User, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  createdAt: string;
  isUser: boolean;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChat({ isOpen, onClose }: AIChatProps) {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory, isLoading: historyLoading } = useQuery<ChatMessageType[]>({
    queryKey: ["/api/chat/history"],
    enabled: isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message: messageText,
        context: { userRole: user?.role, timestamp: new Date().toISOString() }
      });
      return response.json();
    },
    onSuccess: (data) => {
      const newMessage: ChatMessage = {
        id: `${Date.now()}-response`,
        message: message,
        response: data.message,
        createdAt: new Date().toISOString(),
        isUser: false
      };
      
      setLocalMessages(prev => [...prev, newMessage]);
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      message: message,
      createdAt: new Date().toISOString(),
      isUser: true
    };
    
    setLocalMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      const formattedHistory = chatHistory.map((msg: any) => ({
        id: msg.id,
        message: msg.message,
        response: msg.response,
        createdAt: msg.createdAt,
        isUser: false
      }));
      setLocalMessages(formattedHistory);
    }
  }, [chatHistory]);

  const getRoleBasedWelcome = () => {
    if (!user) return "Hi! I'm your AI assistant. Please sign in to get personalized help.";
    
    switch (user.role) {
      case "vendor":
        return "Hi! I'm here to help you with submission requirements, challenge applications, and improving your solution presentations.";
      case "government":
      case "contracting_officer":
        return "Hi! I can assist you with procurement processes, technology evaluation, acquisition pathways, and regulatory compliance.";
      case "admin":
        return "Hi! I'm here to help you manage the platform, challenges, and user support.";
      default:
        return "Hi! I'm your AI assistant. How can I help you with the G-TEAD Marketplace today?";
    }
  };

  const getSampleQuestions = () => {
    if (!user) return [];
    
    switch (user.role) {
      case "vendor":
        return [
          "How do I submit a solution?",
          "What are the requirements for xTechHumanoid?",
          "How can I improve my pitch video?",
          "What documents do I need for NATO eligibility?"
        ];
      case "government":
      case "contracting_officer":
        return [
          "How do I search for solutions?",
          "What is the procurement process?",
          "How do FAR and OT agreements differ?",
          "How can I access assessment packages?"
        ];
      default:
        return [
          "How does the marketplace work?",
          "What types of challenges are available?",
          "How can I get started?"
        ];
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-lg">AI Assistant</SheetTitle>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                data-testid="button-close-chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {user && (
              <Badge variant="secondary" className="w-fit">
                {user.role} mode
              </Badge>
            )}
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Welcome Message */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-foreground">{getRoleBasedWelcome()}</p>
                </div>
              </div>

              {/* Sample Questions */}
              {localMessages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground px-3">Try asking:</p>
                  {getSampleQuestions().map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start text-xs h-auto py-2 px-3"
                      onClick={() => setMessage(question)}
                      data-testid={`sample-question-${index}`}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              )}

              {/* Loading History */}
              {historyLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground ml-2">Loading chat history...</span>
                </div>
              )}

              {/* Chat Messages */}
              {localMessages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  {/* User Message */}
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs">
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* AI Response */}
                  {msg.response && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-secondary rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-foreground">{msg.response}</p>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {sendMessageMutation.isPending && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                placeholder={isAuthenticated ? "Type your question here..." : "Sign in to use AI assistant"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendMessageMutation.isPending || !isAuthenticated}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !message.trim() || !isAuthenticated}
                size="sm"
                data-testid="button-send-chat"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
