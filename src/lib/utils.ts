import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const CATEGORY_ICONS: Record<string, string> = {
  food: 'utensils',
  sightseeing: 'map-pin',
  transport: 'car',
  activity: 'sparkles',
  accommodation: 'home',
};

export const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-amber-100 text-amber-700',
  sightseeing: 'bg-blue-100 text-blue-700',
  transport: 'bg-green-100 text-green-700',
  activity: 'bg-purple-100 text-purple-700',
  accommodation: 'bg-indigo-100 text-indigo-700',
};

export const BUDGET_TIERS = [
  { id: 'economy', label: 'Economy', description: 'Budget-friendly options', icon: 'wallet' },
  { id: 'mid-range', label: 'Mid-Range', description: 'Comfort & value balance', icon: 'credit-card' },
  { id: 'luxury', label: 'Luxury', description: 'Premium experiences', icon: 'crown' },
] as const;

export type BudgetTier = typeof BUDGET_TIERS[number]['id'];

import { OnboardingData, TravelPlan, Hotel, DayPlan, Activity } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function callBackendAPI(question: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.answer || data.error || 'No response from backend';
}

export const syncWithBackendAPI = async (onboardingData: OnboardingData): Promise<{ plan: TravelPlan; answer: string }> => {
  const budgetLabel = onboardingData.budgetTier === 'mid-range' ? 'mid-range' : onboardingData.budgetTier;
  const question = `Plan a ${onboardingData.duration}-day trip to ${onboardingData.destination} with a ${budgetLabel} budget. Provide complete day-by-day itinerary, recommended hotels with prices, places of attractions, restaurants, activities, transportation, detailed cost breakdown, and weather details.`;

  const answer = await callBackendAPI(question);

  // Return minimal plan structure - backend returns markdown text, not structured data
  const plan: TravelPlan = {
    destination: onboardingData.destination,
    duration: onboardingData.duration,
    budgetTier: onboardingData.budgetTier,
    hotels: [],
    itinerary: [],
    totalEstimatedCost: 0,
  };

  return { plan, answer };
};

export const sendChatMessage = async (message: string, travelPlan: TravelPlan | null): Promise<string> => {
  let question = message;
  if (travelPlan) {
    question = `Current trip context: ${travelPlan.duration}-day trip to ${travelPlan.destination} (${travelPlan.budgetTier} budget). User request: ${message}`;
  }
  return callBackendAPI(question);
};