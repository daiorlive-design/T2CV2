# Thoughts2Code - Code Walkthrough

A programming tutor for neurodivergent learners. React + TypeScript frontend, Python FastAPI backend, LLM-powered via OpenRouter.

---

## How it works

1. User asks a coding or CS question
2. The bot asks the user to attempt an answer first (Socratic method)
3. It evaluates the attempt: hints if wrong, prompts for edge cases if correct
4. Only after the user has engaged does it show pseudocode, then real code on request

The entire learning flow is driven by the system prompt - there is no state machine in code. The LLM reads the conversation history and follows the prompt rules to decide what stage the user is at.

Responses use a custom XML format (`<steps>`, `<code>`, `<suggestions>`, `<complexity>`) that the frontend parses and renders as structured UI components.

---

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- An API key for OpenRouter

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # then fill in your API key
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. The frontend proxies API calls to the backend at `http://localhost:8000`.

### Environment variables

**Backend `.env`:**
- `OPENROUTER_API_KEY` - your OpenRouter API key
- `LLM_MODEL` - model identifier (default: `"openai/gpt-oss-120b:free"`)
- `FRONTEND_URL` - CORS origin (default: `"http://localhost:5173"`)

**Frontend `.env` (optional):**
- `VITE_API_URL` - backend URL (defaults to `"/api"`, handled by Vite proxy in dev)

---

## Project structure

```
backend/
  app/
    main.py                  # FastAPI app, CORS, health check
    core/
      config.py              # Settings from .env (OpenRouter key, model)
      prompts.py             # System prompts for all modes and difficulties
    models/
      schemas.py             # Pydantic models (ChatRequest, Message, enums)
    routers/
      chat.py                # POST /api/chat (streaming) and POST /api/run (code exec)
    services/
      llm_service.py         # LLM streaming via OpenRouter
      code_runner.py          # Sandboxed Python code execution

frontend/
  src/
    App.tsx                  # Root component, theme/font/fontSize application
    main.tsx                 # React entry point
    stores/
      chatStore.ts           # Zustand state (conversations, settings, streaming)
    hooks/
      useChat.ts             # Send message, stream response, abort handling
    services/
      api.ts                 # SSE streaming fetch client
    utils/
      parseSteps.ts          # Parses XML tags from LLM output into structured data
    data/
      starterPrompts.ts      # Starter prompt examples for empty chat state
    components/
      chat/
        ChatView.tsx         # Main chat area, message list, empty state
        MessageBubble.tsx    # Single message rendering with all parsed components
        InputBar.tsx         # Auto-resizing text input, send/stop buttons
        StepList.tsx         # Numbered step badges (new/kept/removed)
        ChipRow.tsx          # Clickable suggestion chips
        SequenceDiagramRenderer.tsx  # Inline WSD diagram with fallback
      code/
        CodeBlock.tsx        # Syntax-highlighted code with copy button
      common/
        ComplexityMeter.tsx  # 1-5 bar difficulty indicator
      layout/
        Sidebar.tsx          # Chat history, settings (theme, difficulty, font, size)
    lib/
      wsd/
        buildWebSequenceDiagramUrl.ts  # URL builder for WSD image API
        getSequenceDiagramAltText.ts   # Extracts diagram title for alt text
        validateWsdSource.ts           # Length/empty validation
    styles/
      globals.css            # CSS variables, dark/light themes, animations
```

---

## Key files explained

### Backend

**`prompts.py`** - The core of the product. Contains `SYSTEM_PROMPT_BASE` (guided learning flow, response format, security rules), `SYSTEM_PROMPT_ND_ADDON` (neurodivergent adjustments - always active), `SYSTEM_PROMPT_STRICT_ADDON` (strict mode overrides with stricter answer classification and attempt limits), and `SYSTEM_PROMPT_CODE_EXPLAIN` (reverse mode for explaining pasted code). The `build_system_prompt()` function composes these based on the user's mode and difficulty settings.

**`llm_service.py`** - Handles streaming chat via OpenRouter (using the OpenAI-compatible API). Builds the message array from conversation history, calls the provider, and yields SSE-formatted token events. Uses `temperature=0.7` and `max_tokens=2048`.

**`chat.py`** - Two endpoints. `/api/chat` streams the LLM response as Server-Sent Events with event types `token`, `done`, and `error`. `/api/run` executes user code in a subprocess with a timeout.

**`schemas.py`** - Pydantic models defining the API contract. `ChatMode` (thought_to_code / code_to_explain), `Difficulty` (light / strict), `ChatRequest` (message + conversation history + settings).

**`config.py`** - Loads settings from `.env` via pydantic-settings. Configures the OpenRouter API key, model, CORS origin, and code execution timeout.

**`code_runner.py`** - Writes user code to a temp file and runs it via subprocess with restricted environment and timeout. Research prototype - not production-safe.

### Frontend

**`chatStore.ts`** - Zustand store persisted to localStorage. Holds conversations (id, title, messages, timestamps), user settings (mode, difficulty, theme, font, fontSize), and streaming state. All UI state flows from here.

**`useChat.ts`** - Hook that orchestrates sending a message: creates a conversation if needed, adds the user message, creates an empty assistant message, calls the streaming API, and accumulates tokens into the assistant message. Pins responses to their original conversation so switching chats mid-stream doesn't break anything.

**`api.ts`** - Fetch-based SSE client. Reads the response stream chunk by chunk, parses SSE events, and calls callbacks for each token/done/error event. Supports AbortSignal for cancellation.

**`parseSteps.ts`** - Parses the LLM's XML-tagged output into structured data. Extracts `<step>` tags into Step objects, `<code>` tags into CodeBlock objects, `<chip>` tags into Suggestion objects, and `<complexity>` into a number. `stripXmlTags()` removes all structured blocks to produce clean prose for markdown rendering. Falls back to markdown patterns (numbered lists, fenced code blocks) if XML tags are missing.

**`MessageBubble.tsx`** - Renders a single message. For assistant messages: parses all structured data, renders plain text as markdown (ReactMarkdown + GFM), then renders StepList, ComplexityMeter, CodeBlocks, and ChipRow as separate components. Chips either send a message directly or prefill the input bar (if the chip label contains `[bracketed text]`).

**`ChatView.tsx`** - The main chat area. Shows an empty state with randomized starter prompts when no messages exist. Renders the message list and auto-scrolls to bottom. Manages the InputBar with prefill support from chip clicks.

**`Sidebar.tsx`** - Left panel with chat history (create, rename, delete conversations) and a settings popover (theme toggle, difficulty selector, font picker, font size slider).

**`globals.css`** - CSS custom properties for dark and light themes, font imports (JetBrains Mono for code, OpenDyslexic for accessibility), thinking-dots animation, streaming cursor blink, and styled scrollbars.

---

## Data flow

```
User types message
  -> InputBar.onSend()
  -> useChat.sendMessage()
  -> chatStore.addMessage(user)
  -> chatStore.addMessage(empty assistant)
  -> api.streamChat(POST /api/chat)
  -> chat.py router
  -> llm_service.stream_chat()
  -> build_system_prompt(mode, difficulty)
  -> OpenRouter API (streaming)
  -> SSE events back to frontend
  -> useChat token callback
  -> chatStore.updateLastAssistantMessage()
  -> MessageBubble re-renders with parsed content
```

---

## Learning flow (light vs strict)

The guided learning flow is enforced entirely by the system prompt. The backend sends the full conversation history with each request, so the LLM can count attempts and decide what stage the user is at.

**Light mode:**
- Wrong/partial answer: 1 hint, then advance to pseudocode after 2nd attempt
- Correct answer (coding): ask about edge cases, then pseudocode after any response
- Correct answer (conceptual): give explanation immediately

**Strict mode:**
- Wrong answer: up to 3 attempts, each with a hint
- Partial answer: up to 2 attempts with a hint
- Correct answer (coding): ask about edge cases, evaluate response, allow one retry if partial
- Strict classification rules: vague answers count as wrong, not partial

See `FLOW.md` for the full specification.

---

## Sequence diagrams (WebSequenceDiagrams)

After the bot shows pseudocode, a "Show Diagram" chip appears alongside "Show Python" and "Show JavaScript". Clicking it makes the LLM generate a sequence diagram using WebSequenceDiagrams syntax inside a ` ```sequence ` fenced code block.

**How it renders:**
1. The LLM outputs a markdown fence with language `sequence` or `wsd`
2. `stripXmlTags()` preserves these fences (unlike other code fences which get stripped)
3. `parseCodeBlocks()` skips them (so they don't render as a CodeBlock component)
4. ReactMarkdown's custom `code` component in `MessageBubble.tsx` intercepts them
5. `SequenceDiagramRenderer` validates the source, builds a URL (`https://www.websequencediagrams.com/cgi-bin/cdraw?s=modern-blue&m=<encoded>`), and renders it as an `<img>` tag
6. If rendering fails, a fallback shows the raw source in a collapsible panel

**Prompt guidance for the LLM:** the system prompt includes a WSD syntax reference listing valid keywords (`alt`/`else`/`end`, `loop`/`end`, `opt`/`end`, `note`) and explicitly bans invalid keywords (`if`/`endif`, `while`/`endwhile`, etc.) that WSD silently ignores. Two examples are provided - a branching example (binary search) and a multi-participant example (BFS with Queue/Visited) - to guide the LLM toward diagrams that use multiple participants for data structures, which is where sequence diagrams are most useful.

**Key files:**
- `lib/wsd/` - three pure utility functions (URL builder, alt text extractor, source validator)
- `components/chat/SequenceDiagramRenderer.tsx` - React component with error fallback
- `MessageBubble.tsx` - ReactMarkdown `code` override that routes `sequence`/`wsd` blocks to the renderer

**Security:** diagram content is sent to websequencediagrams.com as a URL parameter. Acceptable for educational algorithm diagrams. Source is always `encodeURIComponent()`-encoded, image uses `referrerPolicy="no-referrer"`, no HTML injection possible.

See the "Show Diagram" section in `prompts.py` for the full WSD syntax reference given to the LLM.

---

## Accessibility

- OpenDyslexic font option
- Adjustable font size (8-18pt)
- Dark and light themes
- Max 5 steps per response (neurodivergent-friendly)
- Concrete language, short paragraphs
- Complexity meter on every response
- Suggestion chips so users always know what to do next
