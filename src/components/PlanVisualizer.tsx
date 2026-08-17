'use client';

import { useState } from 'react';
import { MapPin, Calendar, DollarSign, Star, ChevronRight, ChevronDown, Hotel as HotelIcon, Utensils, MapPin as MapPinIcon, Car, Sparkles, Home, Clock, DollarSign as DollarSignIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TravelPlan, Hotel, DayPlan, Activity } from '@/types';
import { formatCurrency, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/utils';

interface PlanVisualizerProps {
  plan: TravelPlan;
  isLoading: boolean;
}

export function PlanVisualizer({ plan, isLoading }: PlanVisualizerProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set(plan.itinerary.map(d => d.day)));

  const toggleDay = (day: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  if (isLoading) {
    return <PlanSkeleton />;
  }

  const hasStructuredData = plan.hotels.length > 0 || plan.itinerary.length > 0;

  return (
    <div className="flex flex-col h-full bg-offwhite-50">
      <PlanHeader plan={plan} />
      
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {hasStructuredData ? (
          <>
            <HotelSection hotels={plan.hotels} />
            <ItinerarySection 
              itinerary={plan.itinerary} 
              expandedDays={expandedDays}
              onToggleDay={toggleDay}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-900/10 flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-navy-900" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Full Plan in Chat</h3>
            <p className="text-slate-600 max-w-md">
              The AI has generated a comprehensive travel plan with hotels, day-by-day itinerary, 
              restaurants, activities, and cost breakdown. View the complete response in the 
              <span className="font-medium text-navy-900">Chat</span> tab.
            </p>
            <div className="mt-6 p-4 bg-slate-100 rounded-xl text-sm text-slate-500">
              Switch to the Chat tab to see the full markdown response from the travel agent.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanHeader({ plan }: { plan: TravelPlan }) {
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 p-4 lg:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-navy-900">{plan.destination}</h2>
          <p className="text-slate-600 mt-1">Your personalized travel itinerary</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-navy-900">{plan.duration} Days</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-navy-900">{formatCurrency(plan.totalEstimatedCost)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl">
            <Star className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-navy-900 capitalize">{plan.budgetTier.replace('-', ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HotelSection({ hotels }: { hotels: Hotel[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
          <HotelIcon className="w-5 h-5" />
          Recommended Hotels
        </h3>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </section>
  );
}

function HotelCard({ hotel }: { hotel: Hotel }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  
  return (
    <div className="card min-w-[280px] max-w-[320px] flex-shrink-0 overflow-hidden">
      <div className="relative h-40 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <span className="text-xs font-medium bg-sand-500 px-2 py-1 rounded-full">{hotel.location}</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <h4 className="font-semibold text-navy-900 text-lg">{hotel.name}</h4>
        <div className="flex items-center gap-2">
          {stars.map((star) => (
            <Star
              key={star}
              className={cn(
                'w-4 h-4',
                star <= hotel.starRating ? 'fill-sand-500 text-sand-500' : 'text-slate-300'
              )}
            />
          ))}
          <span className="text-sm text-slate-500 ml-1">{hotel.starRating}.0</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <MapPinIcon className="w-4 h-4" />
          <span>{hotel.location}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-2xl font-bold text-navy-900">{formatCurrency(hotel.pricePerNight)}</span>
            <span className="text-slate-500 text-sm ml-1">/night</span>
          </div>
          <button className="btn-accent text-sm px-4 py-2">
            Book Now
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {hotel.amenities.slice(0, 4).map((amenity) => (
            <span key={amenity} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
              {amenity}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ItinerarySection({ 
  itinerary, 
  expandedDays, 
  onToggleDay 
}: { 
  itinerary: DayPlan[];
  expandedDays: Set<number>;
  onToggleDay: (day: number) => void;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
        <MapPinIcon className="w-5 h-5" />
        Day-by-Day Itinerary
      </h3>
      <div className="space-y-4">
        {itinerary.map((day, index) => (
          <DayTimelineCard
            key={day.day}
            day={day}
            isExpanded={expandedDays.has(day.day)}
            onToggle={() => onToggleDay(day.day)}
            isFirst={index === 0}
            isLast={index === itinerary.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function DayTimelineCard({ 
  day, 
  isExpanded, 
  onToggle, 
  isFirst, 
  isLast 
}: { 
  day: DayPlan;
  isExpanded: boolean;
  onToggle: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="card relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" style={{ 
        top: isFirst ? '1.5rem' : 0,
        bottom: isLast ? '1.5rem' : 0,
      }} />
      
      <button
        onClick={onToggle}
        className="relative flex items-start gap-4 p-4 w-full text-left"
      >
        <div className="relative z-10 flex-shrink-0">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center border-4 transition-all duration-300',
            isExpanded
              ? 'bg-sand-500 border-sand-500 text-white'
              : 'bg-white border-slate-200 text-navy-900'
          )}>
            <span className={cn('font-bold', isExpanded ? 'text-white' : 'text-navy-900')}>
              {day.day}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-navy-900">Day {day.day}</h4>
              <p className="text-sm text-slate-500">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-navy-900">
                {formatCurrency(day.totalEstimatedCost)}
              </span>
              <ChevronDown 
                className={cn(
                  'w-5 h-5 text-slate-400 transition-transform duration-300',
                  isExpanded && 'rotate-180'
                )}
              />
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="pl-16 pb-4 pr-4 animate-slide-up">
          <div className="space-y-3">
            {day.activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-500">Day Total</span>
              <span className="font-semibold text-navy-900">{formatCurrency(day.totalEstimatedCost)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const IconComponent = getIconComponent(activity.category);
  const categoryColor = CATEGORY_COLORS[activity.category] || 'bg-slate-100 text-slate-700';
  
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors">
      <div className={cn('p-2 rounded-lg flex-shrink-0', categoryColor)}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h5 className="font-medium text-navy-900">{activity.title}</h5>
            <p className="text-sm text-slate-600 mt-0.5">{activity.description}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {activity.time}
            </span>
            {activity.estimatedCost > 0 && (
              <span className="text-sm font-medium text-navy-900 flex items-center gap-1">
                <DollarSignIcon className="w-3.5 h-3.5" />
                {formatCurrency(activity.estimatedCost)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getIconComponent(category: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    food: Utensils,
    sightseeing: MapPinIcon,
    transport: Car,
    activity: Sparkles,
    accommodation: Home,
  };
  return icons[category] || Sparkles;
}

function PlanSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 p-4 lg:p-6">
        <div className="space-y-3 max-w-md">
          <div className="h-6 w-3/4 skeleton rounded" />
          <div className="h-4 w-1/2 skeleton rounded" />
          <div className="flex gap-3">
            <div className="h-10 w-24 skeleton rounded-xl" />
            <div className="h-10 w-28 skeleton rounded-xl" />
            <div className="h-10 w-32 skeleton rounded-xl" />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div className="space-y-4">
          <div className="h-5 w-32 skeleton rounded" />
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[280px] max-w-[320px] flex-shrink-0 card">
                <div className="h-40 skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-6 w-3/4 skeleton rounded" />
                  <div className="h-4 w-1/2 skeleton rounded" />
                  <div className="h-4 w-1/3 skeleton rounded" />
                  <div className="h-8 w-full skeleton rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-5 w-40 skeleton rounded" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="p-4 skeleton h-14" />
                <div className="pl-16 pb-4 pr-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex gap-3 p-3 skeleton rounded-xl" />
                  ))}
                  <div className="pt-3 h-6 skeleton w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}