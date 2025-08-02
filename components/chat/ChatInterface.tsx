'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, AlertCircle, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RateLimitInfo {
  hourlyRemaining: number;
  dailyRemaining: number;
  resetTime: Date | null;
}

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { 
    messages, 
    sendMessage,
    status,
    error 
  } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
      
      // Parse rate limit information from error
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.type === 'hourly' || errorData.type === 'daily') {
          setRateLimitInfo({
            hourlyRemaining: errorData.type === 'hourly' ? 0 : rateLimitInfo?.hourlyRemaining || 0,
            dailyRemaining: errorData.type === 'daily' ? 0 : rateLimitInfo?.dailyRemaining || 0,
            resetTime: new Date(errorData.reset)
          });
        }
      } catch (e) {
        // Error parsing, use generic error handling
      }
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, status]);

  const isLoading = status === 'submitted' || status === 'streaming';
  const isRateLimited = error?.message.includes('Rate limit');
  const isInputDisabled = isLoading || isRateLimited;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInputDisabled && input && input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isInputDisabled && input && input.trim()) {
        sendMessage({ text: input });
        setInput('');
      }
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            RAG-Powered
          </Badge>
          {rateLimitInfo && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {rateLimitInfo.dailyRemaining} daily remaining
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-full p-3" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-6">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <h4 className="font-medium mb-1">Start a conversation</h4>
                <p className="text-sm">
                  Ask me about your job applications, interview prep, or career advice!
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.parts.map((part, index) => {
                      if (part.type === 'text') {
                        return <span key={index}>{part.text}</span>;
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                    <span className="text-xs text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex-shrink-0 p-2 pt-0 space-y-1">
        {error && (
          <Alert className="mb-1" variant={isRateLimited ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {isRateLimited 
                ? `Rate limit reached. Try again ${rateLimitInfo?.resetTime ? 
                    `at ${rateLimitInfo.resetTime.toLocaleTimeString()}` : 
                    'in a few minutes'}.`
                : 'Failed to send message. Please try again.'
              }
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRateLimited 
                ? "Rate limit reached..." 
                : "Ask about your job search..."
            }
            disabled={isInputDisabled}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isInputDisabled || !input || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <p className="text-xs text-muted-foreground text-center">
          AI responses use your job data for personalized advice
        </p>
      </CardFooter>
    </Card>
  );
}