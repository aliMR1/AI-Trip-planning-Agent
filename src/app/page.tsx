'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { ChatInterface } from '@/components/ChatInterface';
import { PlanVisualizer } from '@/components/PlanVisualizer';
import { Header } from '@/components/Header';
import { OnboardingData, TravelPlan, Message } from '@/types';
import { syncWithBackendAPI, sendChatMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function Home() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 'complete'>(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [activePanel, setActivePanel] = useState<'chat' | 'plan'>('chat');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    setOnboardingData(data);
    setOnboardingStep('complete');
    setShowOnboarding(false);
    setIsLoading(true);

    const newMessages: Message[] = [
      {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: `I want to plan a ${data.duration}-day trip to ${data.destination} with a ${data.budgetTier} budget.`,
        timestamp: new Date(),
      },
    ];

    setMessages(newMessages);

    try {
      const { plan, answer } = await syncWithBackendAPI(data);
      setTravelPlan(plan);
      
      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to generate plan:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an issue generating your travel plan. Please try again or contact support.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await sendChatMessage(content, travelPlan);
      
      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setOnboardingData(null);
    setOnboardingStep(1);
    setMessages([]);
    setIsLoading(false);
    setTravelPlan(null);
    setActivePanel('chat');
    setShowOnboarding(true);
  };

  return (
    <div className="min-h-screen bg-offwhite-50 flex flex-col">
      <Header 
        onRestart={handleRestart}
        hasPlan={!!travelPlan}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      />
      
      <main className="flex-1 flex overflow-hidden">
        {showOnboarding ? (
          <OnboardingFlow
            step={onboardingStep}
            onStepChange={setOnboardingStep}
            onComplete={handleOnboardingComplete}
          />
        ) : (
          <div className={cn(
            'flex flex-1 overflow-hidden',
            'lg:grid lg:grid-cols-[1fr_480px]'
          )}>
            <div className={cn(
              'flex flex-col min-w-0',
              'lg:border-r lg:border-slate-200'
            )}>
              <ChatInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                chatEndRef={chatEndRef}
                hasPlan={!!travelPlan}
              />
            </div>
            
            {travelPlan && (
              <div className="hidden lg:block min-w-0">
                <PlanVisualizer
                  plan={travelPlan}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}