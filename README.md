# AI Travel Agent

A full-stack AI-powered travel planning application with a premium Next.js frontend and a FastAPI/LangGraph backend featuring real-time tools for weather, place search, expense calculation, and currency conversion.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXT.JS FRONTEND (Port 3000)            │
│  ┌─────────────┐  ┌─────────────────────────────────────────┐  │
│  │ Onboarding  │  │ Dual-Panel Layout                       │  │
│  │ Flow (3-step)│  │ ├─ Chat Interface (Left)              │  │
│  └──────┬──────┘  │ │  • Message bubbles + Markdown         │  │
│         │         │ │  • Typing indicator                   │  │
│         ▼         │ │  • Sticky input                       │  │
│  ┌─────────────┐  │ ├─ Plan Visualizer (Right)              │  │
│  │  State Mgmt │  │ │  • Summary header                     │  │
│  │ (React hooks)│  │ │  • Hotel carousel + Book actions     │  │
│  └──────┬──────┘  │ │  • Expandable day timeline           │  │
│         │         │ └─────────────────────────────────────────┘  │
└─────────│───────────────────────────────────────────────────────┘
          │ HTTP POST /query
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND (Port 8000)               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ POST /query → LangGraph Agent                           │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │   │
│  │  │ Agent Node  │───▶│ Tools Node  │───▶│ Agent Node  │  │   │
│  │  │ (LLM + Tools)    │ (ToolNode)  │    │ (Finalize)  │  │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│         ┌────────────────┼────────────────┐                    │
│         ▼                ▼                ▼                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Weather     │  │ Place       │  │ Expense     │            │
│  │ Tool        │  │ Search      │  │ Calculator  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                │                │                    │
│         ▼                ▼                ▼                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Currency Conversion Tool                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### Frontend (Next.js 14 + TypeScript + Tailwind)
- **Dual-Panel Layout**: Chat (left) + Plan Visualizer (right) on desktop, tabbed on mobile
- **3-Step Onboarding**: Destination → Duration → Budget Tier (Economy/Mid-range/Luxury)
- **Immersive Chat**: Navy user bubbles, slate AI bubbles, Markdown rendering, typing indicator
- **Live Plan Visualizer**: Hotel carousel with "Book Now", expandable day-by-day timeline
- **Responsive Design**: Clean navy/sand/slate/off-white palette

### Backend (FastAPI + LangGraph + Groq/OpenAI)
- **Agentic Workflow**: LangGraph StateGraph with conditional tool routing
- **Real-time Tools**:
  - Weather info (current + forecast)
  - Place search (attractions, restaurants, hotels)
  - Expense calculator (budget breakdowns)
  - Currency conversion (real-time rates)
- **LLM Providers**: Groq (default), OpenAI compatible
- **CORS Enabled**: Ready for frontend integration

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React |
| **Backend** | FastAPI, LangGraph, LangChain, Pydantic |
| **LLM** | Groq (Llama 3), OpenAI compatible |
| **Tools** | Weather API, Place Search, Calculator, Currency API |
| **DevOps** | Docker-ready, GitHub Actions CI/CD compatible |

## Project Structure

```
AI-Trip-planning-Agent/
├── src/                          # Next.js Frontend
│   ├── app/
│   │   ├── globals.css           # Tailwind + custom styles
│   │   ├── layout.tsx            # Root layout + Inter font
│   │   └── page.tsx              # Main page + state management
│   ├── components/
│   │   ├── ChatInterface.tsx     # Messaging terminal
│   │   ├── Header.tsx            # Navigation + tab switching
│   │   ├── MarkdownRenderer.tsx  # Rich text (MD → HTML)
│   │   ├── OnboardingFlow.tsx    # 3-step onboarding
│   │   └── PlanVisualizer.tsx    # Hotels + itinerary display
│   ├── lib/
│   │   └── utils.ts              # API calls, formatters, types
│   └── types/
│       └── index.ts              # TypeScript interfaces
│
├── agent/                        # LangGraph Agent
│   ├── __init__.py
│   └── agentic_workflow.py       # GraphBuilder, agent_function
│
├── tools/                        # Real-time Tools
│   ├── weather_man.py            # Weather info tool
│   ├── place_finder.py           # Place search tool
│   ├── expense_calculator_tool.py # Budget/expense tool
│   └── currency_conversion_tool.py # Currency conversion
│
├── utils/                        # Backend Utilities
│   ├── model_loader.py           # LLM loading (Groq/OpenAI)
│   ├── weather_info.py           # Weather API client
│   ├── place_info_search.py      # Place search client
│   ├── calculator_util.py        # Expense calculations
│   └── currency_convertor_util.py # Currency conversion
│
├── prompt_library/
│   └── prompt.py                 # System prompt for travel agent
│
├── main.py                       # FastAPI app + /query endpoint
├── start_server.py               # Uvicorn entry point
├── app.py                        # Streamlit UI (alternative)
├── requirements.txt              # Python dependencies
├── package.json                  # Node dependencies
└── README.md
```

## Getting Started

### Prerequisites
- **Node.js 18+** & npm
- **Python 3.10+** & pip
- **Groq API Key** (free at https://console.groq.com) or OpenAI API Key

### Quick Start

#### 1. Backend (Terminal 1)
```bash
cd AI-Trip-planning-Agent-master

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env  # Create .env with your keys
# Edit .env: GROQ_API_KEY=your_key_here
#            MODEL_PROVIDER=groq

# Start FastAPI server
python start_server.py
# Runs on http://localhost:8000
# API docs: http://localhost:8000/docs
```

#### 2. Frontend (Terminal 2)
```bash
cd AI-Trip-planning-Agent-master

# Install dependencies
npm install

# Start development server
npm run dev
# Runs on http://localhost:3000
```

#### 3. Use the App
1. Open http://localhost:3000
2. Complete 3-step onboarding (Destination, Days, Budget)
3. View generated plan in Chat tab (full markdown) or Plan tab (structured view)
4. Ask follow-up questions in chat to modify the plan

### Environment Variables

**Backend (`.env`):**
```bash
GROQ_API_KEY=your_groq_key_here
# OR
OPENAI_API_KEY=your_openai_key_here
MODEL_PROVIDER=groq  # or openai
```

**Frontend (`.env.local`):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Reference

### POST `/query`
Generate travel plan or handle chat messages.

**Request:**
```json
{
  "question": "Plan a 5-day trip to Tokyo with a mid-range budget..."
}
```

**Response:**
```json
{
  "answer": "# AI Travel Plan\n\n## Day 1...\n\n### Hotels...\n\n### Cost Breakdown...\n"
}
```

### Health Check
```bash
GET /health  # Returns {"status": "ok"}
```

## Customization

### Frontend Colors (`tailwind.config.js`)
```javascript
colors: {
  navy: { 900: '#0F172A', 800: '#1E293B', 700: '#334155' },
  sand: { 500: '#F59E0B', 400: '#FBBF24', 600: '#D97706' },
  slate: { 100: '#F1F5F9', 200: '#E2E8F0' },
  offwhite: { 50: '#F8FAFC' },
}
```

### Backend Tools
Add new tools in `tools/` and register in `agent/agentic_workflow.py`:
```python
self.tools.extend([
    *self.new_tool.new_tool_list,
])
```

### System Prompt (`prompt_library/prompt.py`)
Modify the `SYSTEM_PROMPT` to change agent behavior, output format, or constraints.

## Deployment

### Docker (Recommended)
```dockerfile
# Backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "start_server.py"]

# Frontend
FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific
- **Frontend**: Vercel, Netlify, AWS Amplify
- **Backend**: Railway, Render, Fly.io, AWS ECS, Azure Container Apps
- **Database**: Add PostgreSQL/MongoDB for persistence if needed

## License

MIT