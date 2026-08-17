'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight, CheckCircle, Wallet, CreditCard, Crown, Calendar, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingData } from '@/types';
import { BudgetTier, BUDGET_TIERS } from '@/lib/utils';

interface OnboardingFlowProps {
  step: 1 | 2 | 3 | 'complete';
  onStepChange: (step: 1 | 2 | 3 | 'complete') => void;
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingFlow({ step, onStepChange, onComplete }: OnboardingFlowProps) {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(5);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('mid-range');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const validateStep1 = () => {
    if (!destination.trim()) {
      setErrors({ destination: 'Please enter a destination' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep2 = () => {
    if (duration < 1 || duration > 30) {
      setErrors({ duration: 'Duration must be between 1 and 30 days' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = async (currentStep: 1 | 2 | 3) => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      onComplete({ destination, duration, budgetTier });
      setIsSubmitting(false);
      return;
    }
    // Advance to next step for steps 1 and 2
    onStepChange((currentStep + 1) as 1 | 2 | 3);
  };

  const handleBack = () => {
    setErrors({});
  };

  const progressSteps = [
    { num: 1, label: 'Destination', icon: MapPin },
    { num: 2, label: 'Duration', icon: Calendar },
    { num: 3, label: 'Budget', icon: Sparkles },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-md lg:max-w-lg">
        <div className="mb-8 lg:mb-10">
          <div className="flex items-center justify-between mb-4">
            {progressSteps.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300',
                  step === 'complete' || (typeof step === 'number' && s.num < step)
                    ? 'bg-sand-500 text-white'
                    : s.num === step
                    ? 'bg-navy-900 text-white'
                    : 'bg-slate-200 text-slate-400'
                )}>
                  {step === 'complete' || (typeof step === 'number' && s.num < step) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    s.num
                  )}
                </div>
                {idx < progressSteps.length - 1 && (
                  <div className={cn(
                    'hidden lg:block w-16 h-0.5 mx-2 transition-all duration-300',
                    step === 'complete' || (typeof step === 'number' && s.num < step)
                      ? 'bg-sand-500'
                      : 'bg-slate-200'
                  )} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-slate-600 text-sm">
            Step {step === 'complete' ? 3 : step} of 3
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 shadow-sm animate-fade-in">
          {step === 1 && (
            <OnboardingStep1
              destination={destination}
              setDestination={setDestination}
              error={errors.destination}
              onNext={() => handleNext(1)}
              inputRef={inputRef}
            />
          )}

          {step === 2 && (
            <OnboardingStep2
              duration={duration}
              setDuration={setDuration}
              error={errors.duration}
              onNext={() => handleNext(2)}
              onBack={handleBack}
            />
          )}

          {step === 3 && (
            <OnboardingStep3
              budgetTier={budgetTier}
              setBudgetTier={setBudgetTier}
              onComplete={() => handleNext(3)}
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function OnboardingStep1({
  destination,
  setDestination,
  error,
  onNext,
  inputRef,
}: {
  destination: string;
  setDestination: (v: string) => void;
  error?: string;
  onNext: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-900/10 text-navy-900 mb-4">
          <MapPin className="w-8 h-8" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-2">Where are you headed?</h2>
        <p className="text-slate-600">Enter your destination to begin planning your perfect trip</p>
      </div>

      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-navy-900 mb-2">
          Destination
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onNext()}
            placeholder="e.g., Tokyo, Japan"
            className={cn(
              'input-field pl-12 pr-4',
              error && 'border-red-300 focus:ring-red-500/50'
            )}
            autoComplete="off"
            autoFocus
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4">
        {['Paris, France', 'Tokyo, Japan', 'Bali, Indonesia', 'New York, USA'].map((city) => (
          <button
            key={city}
            onClick={() => { setDestination(city); onNext(); }}
            className="btn-secondary text-sm py-2.5"
          >
            {city}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!destination.trim()}
        className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
        <ChevronRight className="w-5 h-5 ml-2 inline" />
      </button>
    </div>
  );
}

function OnboardingStep2({
  duration,
  setDuration,
  error,
  onNext,
  onBack,
}: {
  duration: number;
  setDuration: (v: number) => void;
  error?: string;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-slate-500 hover:text-navy-900 text-sm font-medium flex items-center gap-1"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back
      </button>

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-900/10 text-navy-900 mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-2">How many days?</h2>
        <p className="text-slate-600">Select the duration of your trip</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setDuration(Math.max(1, duration - 1))}
          className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900 transition-colors"
          aria-label="Decrease days"
        >
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <div className="text-center">
          <span className="text-5xl lg:text-7xl font-bold text-navy-900">{duration}</span>
          <p className="text-slate-500 mt-1">{duration === 1 ? 'Day' : 'Days'}</p>
        </div>
        <button
          onClick={() => setDuration(Math.min(30, duration + 1))}
          className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900 transition-colors"
          aria-label="Increase days"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[1, 3, 5, 7, 10].map((days) => (
          <button
            key={days}
            onClick={() => { setDuration(days); onNext(); }}
            className={cn(
              'py-3 rounded-xl text-sm font-medium transition-all',
              duration === days
                ? 'bg-navy-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {days}d
          </button>
        ))}
      </div>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      <button
        onClick={onNext}
        className="btn-primary w-full"
      >
        Continue
        <ChevronRight className="w-5 h-5 ml-2 inline" />
      </button>
    </div>
  );
}

function OnboardingStep3({
  budgetTier,
  setBudgetTier,
  onComplete,
  onBack,
  isSubmitting,
}: {
  budgetTier: BudgetTier;
  setBudgetTier: (v: BudgetTier) => void;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const tierIcons = {
    economy: Wallet,
    'mid-range': CreditCard,
    luxury: Crown,
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-slate-500 hover:text-navy-900 text-sm font-medium flex items-center gap-1"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back
      </button>

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-900/10 text-navy-900 mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-2">What's your budget style?</h2>
        <p className="text-slate-600">Choose the experience level that matches your preferences</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {BUDGET_TIERS.map((tier) => {
          const Icon = tierIcons[tier.id];
          return (
            <button
              key={tier.id}
              onClick={() => setBudgetTier(tier.id)}
              className={cn(
                'relative p-4 rounded-2xl border-2 transition-all duration-200 text-left',
                budgetTier === tier.id
                  ? 'border-sand-500 bg-sand-50 shadow-lg shadow-sand-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <input
                type="radio"
                name="budget"
                value={tier.id}
                checked={budgetTier === tier.id}
                onChange={() => setBudgetTier(tier.id)}
                className="sr-only"
              />
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  'p-2 rounded-xl',
                  budgetTier === tier.id
                    ? 'bg-sand-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  'font-semibold',
                  budgetTier === tier.id ? 'text-navy-900' : 'text-slate-700'
                )}>
                  {tier.label}
                </span>
              </div>
              <p className="text-sm text-slate-500">{tier.description}</p>
              {budgetTier === tier.id && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-sand-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onComplete}
        disabled={isSubmitting}
        className="btn-primary w-full disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating your plan...
          </>
        ) : (
          <>
            Create My Trip
            <ChevronRight className="w-5 h-5 ml-2 inline" />
          </>
        )}
      </button>
    </div>
  );
}