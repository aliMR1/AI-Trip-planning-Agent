# AI Travel Agent - Premium Frontend UI

A modern, premium AI Travel Agent UI built with Next.js 14, React 18, and Tailwind CSS.

## Features

- **Dual-Panel Layout**: Full-screen chat interface (left) + live plan visualizer (right) on desktop, collapses to tabbed view on mobile
- **Interactive Onboarding Flow**: 3-step guided setup (Destination → Duration → Budget Tier)
- **Immersive Chat Interface**: 
  - Styled message bubbles (user: navy, AI: slate)
  - Rich text rendering (bold, lists, tables)
  - Animated typing indicator
  - Sticky input with send button
- **Dynamic Plan Visualizer**:
  - Summary header with destination, duration, budget
  - Horizontal scrolling hotel cards with "Book Now" actions
  - Expandable day-by-day itinerary timeline
  - Activity cards with time, cost, category icons
- **Backend-Ready Architecture**:
  - Clean separation of UI and data state
  - Centralized frontend state object for API payload
  - Empty async handler functions (`syncWithBackendAPI`, `sendChatMessage`) for easy API integration
  - All data loops pull from structured local state

## Color Palette

- **Primary**: Deep Navy Blue `#0F172A`
- **Accent**: Warm Sand `#F59E0B`
- **Message Bubbles**: Soft Slate `#F1F5F9`
- **Background**: Clean Off-White `#F8FAFC`

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd AI-Trip-planning-Agent-master
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles + Tailwind directives
│   ├── layout.tsx           # Root layout with font setup
│   └── page.tsx             # Main page with state management
├── components/
│   ├── ChatInterface.tsx    # Left panel - messaging terminal
│   ├── Header.tsx           # Top navigation with tab switching
│   ├── MarkdownRenderer.tsx # Rich text rendering for AI messages
│   ├── OnboardingFlow.tsx   # 3-step onboarding modal
│   └── PlanVisualizer.tsx   # Right panel - live plan display
├── lib/
│   └── utils.ts             # Utilities, mock data, API handlers
└── types/
    └── index.ts             # TypeScript interfaces
```

## Backend Integration

The frontend is designed for easy backend integration. Key integration points:

### 1. Travel Plan Generation
```typescript
// src/lib/utils.ts
export const syncWithBackendAPI = async (onboardingData: OnboardingData): Promise<TravelPlan> => {
  // Replace with actual API call:
  // const response = await fetch('/api/generate-plan', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(onboardingData),
  // });
  // return response.json();
  
  return createMockTravelPlan(onboardingData);
};
```

### 2. Chat Messages
```typescript
// src/lib/utils.ts
export const sendChatMessage = async (message: string, travelPlan: TravelPlan | null): Promise<string> => {
  // Replace with actual API call:
  // const response = await fetch('/api/chat', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message, travelPlan }),
  // });
  // return response.json();
  
  return `I've noted your request: "${message}". This would be processed by the AI backend.`;
};
```

### 3. State Payload Structure
The onboarding data is collected into a centralized `OnboardingData` object:
```typescript
interface OnboardingData {
  destination: string;
  duration: number;
  budgetTier: 'economy' | 'mid-range' | 'luxury';
}
```

This maps directly to the backend API payload.

## Customization

### Colors
Edit `tailwind.config.js` to customize the color palette:
```javascript
colors: {
  navy: { 900: '#0F172A', ... },
  sand: { 500: '#F59E0B', ... },
  slate: { 100: '#F1F5F9', ... },
  offwhite: { 50: '#F8FAFC', ... },
}
```

### Mock Data
Modify `MOCK_HOTELS` and `MOCK_ITINERARY` in `src/lib/utils.ts` to change placeholder data.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## License

MIT