'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message, TravelPlan } from '@/types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  hasPlan: boolean;
}

export function ChatInterface({ messages, isLoading, onSendMessage, chatEndRef, hasPlan }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [textareaHeight, setTextareaHeight] = useState(48);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      const height = Math.min(textareaRef.current.scrollHeight, 160);
      setTextareaHeight(height);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setTextareaHeight(48);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        onSendMessage(inputValue.trim());
        setInputValue('');
        setTextareaHeight(48);
      }
    }
  };

  const displayMessages = useMemo(() => {
    const msgArray = [...messages];
    if (isLoading) {
      msgArray.push({
        id: 'typing-indicator',
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      } as Message);
    }
    return msgArray;
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-offwhite-50">
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4"
        aria-live="polite"
      >
        {displayMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isTyping={message.id === 'typing-indicator'}
          />
        ))}
        <div ref={messagesEndRef} />
        <div ref={chatEndRef} />
      </div>

      {hasPlan && (
        <div className="px-4 py-3 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
          <p className="text-xs text-center text-slate-500">
            Switch to the <span className="font-medium text-navy-900">Plan</span> tab to view your itinerary
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 lg:p-6 bg-white/80 backdrop-blur-md border-t border-slate-200">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to modify or add details..."
              rows={1}
              style={{ height: textareaHeight, minHeight: 48, maxHeight: 160 }}
              className={cn(
                'input-field resize-none pr-14',
                'placeholder-slate-400 text-navy-900'
              )}
              disabled={isLoading}
              aria-label="Chat input"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              'btn-primary p-3 rounded-xl flex-shrink-0 transition-all duration-200',
              'hover:scale-105 active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            )}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-center text-slate-500 mt-2">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">Shift+Enter</kbd> for new line
        </p>
      </form>
    </div>
  );
}

function MessageBubble({ message, isTyping }: { message: Message; isTyping?: boolean }) {
  const isUser = message.role === 'user';

  if (isTyping) {
    return (
      <div className="flex items-start gap-3 animate-slide-up">
        <div className="w-8 h-8 rounded-full bg-navy-900/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-navy-900" />
        </div>
        <div className="chat-bubble-ai flex items-center gap-2 px-4 py-3 min-w-[120px]">
          <TypingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3 animate-slide-up', isUser ? 'flex-row-reverse' : '')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-navy-900/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-navy-900" />
        </div>
      )}
      <div className={cn(
        'max-w-[80%] lg:max-w-[70%]',
        isUser ? 'text-right' : 'text-left'
      )}>
        <div className={cn(
          'inline-block px-4 py-2.5 rounded-2xl',
          isUser
            ? 'chat-bubble-user'
            : 'chat-bubble-ai'
        )}>
          <MarkdownRenderer content={message.content} />
        </div>
        <p className={cn('text-xs mt-1.5', isUser ? 'text-slate-400' : 'text-slate-400')}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-sand-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-medium">You</span>
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-typing" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-typing" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-typing" style={{ animationDelay: '300ms' }} />
      <span className="text-slate-500 text-sm ml-1">AI is typing...</span>
    </div>
  );
}

import { useState } from 'react';