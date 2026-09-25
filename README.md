# Thoughts2Code

Chat with an AI that breaks your idea into steps and writes the code - built with neurodivergent users in mind.

**UROP Spring 2026** - Georg Ingi Einarsson
Instructors: Pragya Verma, Grischa Liebel

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                    Frontend                      │
│               React + TypeScript                 │
│          (Vite, Zustand, TailwindCSS)            │
│                                                  │
│  ChatView <---> StepList <---> CodeBlock         │
│       │                                          │
│  useChatStore (Zustand)  <--->  useStreaming hook│
│       │                                          │
│  apiService (fetch + SSE)                        │
└───────┼──────────────────────────────────────────┘
        │  HTTP / Server-Sent Events
┌───────┼──────────────────────────────────────────┐
│       ▼           Backend                        │
│              Python + FastAPI                    │
│                                                  │
│  POST /api/chat  -->  LLM Service (streaming)    │
│  POST /api/run   --> Code Runner (sandboxed)     │
│                                                  │
│  LLM Service: prompt mgmt, step extraction,      │
│               streaming via SSE                  │
│                                                  │
│  OpenRouter API (OpenAI-compatible)              │
└──────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | React 18 + TypeScript |
| Bundler | Vite |
| Styling | TailwindCSS |
| State | Zustand |
| Code display | react-syntax-highlighter |
| Backend | FastAPI (Python) |
| LLM | OpenRouter (via openai SDK) |
| Validation | Pydantic |
| Server | uvicorn |

## Getting an API Key

This project uses [OpenRouter](https://openrouter.ai) to access LLMs. OpenRouter is a unified API that routes to many models, including free-tier ones - no credit card required to get started.

1. Go to [openrouter.ai](https://openrouter.ai) and create an account
2. Navigate to **Keys** and create a new API key
3. Copy the key - it starts with `sk-or-v1-...`
4. Paste it into `backend/.env` as `OPENROUTER_API_KEY=sk-or-v1-...`

The default model is `openai/gpt-oss-120b:free`. To use a different model, change `LLM_MODEL` in `backend/.env`. Free models available on OpenRouter include:
- `openai/gpt-oss-120b:free`
- `meta-llama/llama-3.3-70b-instruct:free`
- `google/gemini-2.0-flash-exp:free`

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt    # If the execution of pip fails, try: python -m pip install -r requirements.txt
cp .env.example .env          # Paste your OpenRouter API key here
uvicorn app.main:app --reload --port 8000 # If the execution of pip fails, try: python -m pip install -r requirements.txt uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Notes

- **Step extraction**: the LLM is prompted to return structured steps, which are parsed server-side - no regex hacks on the client
- **No database**: chat history lives in Zustand + localStorage; this is a prototype, not a prod app
- **Sandboxed execution**: the code runner uses subprocess with a timeout, so it's optional and won't hang
