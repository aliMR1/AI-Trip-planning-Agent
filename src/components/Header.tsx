'use client';

import { MapPin, LayoutDashboard, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onRestart: () => void;
  hasPlan: boolean;
  activePanel: 'chat' | 'plan';
  onPanelChange: (panel: 'chat' | 'plan') => void;
}

export function Header({ onRestart, hasPlan, activePanel, onPanelChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-full mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-14">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-navy-900 rounded-xl text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-semibold text-navy-900">AI Travel Agent</h1>
              <p className="text-xs text-slate-500">Your premium travel planning assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasPlan && (
              <div className="hidden lg:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => onPanelChange('chat')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                    activePanel === 'chat'
                      ? 'bg-white text-navy-900 shadow-sm'
                      : 'text-slate-600 hover:text-navy-900'
                  )}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1 inline" />
                  Chat
                </button>
                <button
                  onClick={() => onPanelChange('plan')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                    activePanel === 'plan'
                      ? 'bg-white text-navy-900 shadow-sm'
                      : 'text-slate-600 hover:text-navy-900'
                  )}
                >
                  Plan
                </button>
              </div>
            )}

            <button
              onClick={onRestart}
              className="p-2 rounded-xl text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors lg:hidden"
              aria-label="Restart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="lg:hidden border-t border-slate-200 px-4 py-2">
        <div className="flex items-center justify-center gap-1 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => onPanelChange('chat')}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activePanel === 'chat'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600'
            )}
          >
            Chat
          </button>
          <button
            onClick={() => onPanelChange('plan')}
            disabled={!hasPlan}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activePanel === 'plan'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600'
            )}
          >
            Plan
          </button>
        </div>
      </div>
    </header>
  );
}