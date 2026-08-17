export interface OnboardingData {
  destination: string;
  duration: number;
  budgetTier: 'economy' | 'mid-range' | 'luxury';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Hotel {
  id: string;
  name: string;
  starRating: number;
  pricePerNight: number;
  imageUrl: string;
  location: string;
  amenities: string[];
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  estimatedCost: number;
  category: 'food' | 'sightseeing' | 'transport' | 'activity' | 'accommodation';
  icon: string;
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  totalEstimatedCost: number;
}

export interface TravelPlan {
  destination: string;
  duration: number;
  budgetTier: 'economy' | 'mid-range' | 'luxury';
  hotels: Hotel[];
  itinerary: DayPlan[];
  totalEstimatedCost: number;
}

export interface UIState {
  onboarding: OnboardingData | null;
  onboardingStep: 1 | 2 | 3 | 'complete';
  messages: Message[];
  isLoading: boolean;
  travelPlan: TravelPlan | null;
  activePanel: 'chat' | 'plan';
}