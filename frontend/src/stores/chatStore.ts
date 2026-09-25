import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Step {
  number: number;
  description: string;
  status: "new" | "kept" | "removed";
}

export interface CodeBlock {
  language: string;
  code: string;
}

export interface Suggestion {
  label: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;

  // Settings
  mode: "thought_to_code" | "code_to_explain";
  difficulty: "light" | "strict";
  theme: "dark" | "light";
  font: "arial" | "verdana" | "opendyslexic";
  fontSize: number;
  setFontSize: (fontSize: number) => void;

  // Streaming state
  isStreaming: boolean;
  streamingConversationId: string | null;
  streamingContent: string;

  // Actions
  createConversation: () => string;
  setActiveConversation: (id: string) => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateLastAssistantMessage: (content: string, targetConvId?: string) => void;
  setStreaming: (streaming: boolean, convId?: string) => void;
  setStreamingContent: (content: string) => void;
  setMode: (mode: "thought_to_code" | "code_to_explain") => void;
  setDifficulty: (difficulty: "light" | "strict") => void;
  setTheme: (theme: "dark" | "light") => void;
  setFont: (font: "arial" | "verdana" | "opendyslexic") => void;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;

  // Getters
  getActiveConversation: () => Conversation | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      mode: "thought_to_code",
      difficulty: "light",
      theme: "dark",
      font: "arial",
      fontSize: 12,
      isStreaming: false,
      streamingConversationId: null,
      streamingContent: "",

      createConversation: () => {
        const id = generateId();
        const conversation: Conversation = {
          id,
          title: "",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations].slice(0, 30),
          activeConversationId: id,
        }));
        return id;
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      addMessage: (message) => {
        const msg: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        };
        set((state) => {
          const convos = state.conversations.map((c) => {
            if (c.id === state.activeConversationId) {
              // Auto-title from first user message (only when title is still empty)
              const title =
                c.title === "" && message.role === "user"
                  ? message.content.slice(0, 50).trim()
                  : c.title;
              return {
                ...c,
                title,
                messages: [...c.messages, msg],
                updatedAt: Date.now(),
              };
            }
            return c;
          });
          return { conversations: convos };
        });
      },

      updateLastAssistantMessage: (content, targetConvId?) => {
        set((state) => {
          const id = targetConvId ?? state.activeConversationId;
          const convos = state.conversations.map((c) => {
            if (c.id === id) {
              const messages = [...c.messages];
              const lastIdx = messages.length - 1;
              if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
                messages[lastIdx] = { ...messages[lastIdx], content };
              }
              return { ...c, messages, updatedAt: Date.now() };
            }
            return c;
          });
          return { conversations: convos };
        });
      },

      setStreaming: (streaming, convId?) => set({
        isStreaming: streaming,
        streamingConversationId: streaming ? (convId ?? null) : null,
      }),
      setStreamingContent: (content) => set({ streamingContent: content }),
      setMode: (mode) => set({ mode }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setTheme: (theme) => set({ theme }),
      setFont: (font) => set({ font }),
      setFontSize: (fontSize) => set({ fontSize }),

      renameConversation: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title: title.trim(), updatedAt: Date.now() } : c
          ),
        }));
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversationId:
            state.activeConversationId === id ? null : state.activeConversationId,
        }));
      },

      getActiveConversation: () => {
        const state = get();
        return state.conversations.find((c) => c.id === state.activeConversationId);
      },
    }),
    {
      name: "thoughts2code-chat",
      partialize: (state) => ({
        conversations: state.conversations,
        mode: state.mode,
        difficulty: state.difficulty,
        theme: state.theme,
        font: state.font,
        fontSize: state.fontSize,
      }),
    }
  )
);
