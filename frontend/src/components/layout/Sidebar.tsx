import { useState, useRef, useEffect } from "react";
import { MessageCircle, Plus, Sun, Moon, Settings } from "lucide-react";
import { useChatStore } from "../../stores/chatStore";

export function Sidebar() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    deleteConversation,
    renameConversation,
    theme,
    setTheme,
    difficulty,
    setDifficulty,
    font,
    setFont,
    fontSize,
    setFontSize,
  } = useChatStore();

  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Focus rename input when modal opens
  useEffect(() => {
    if (renameId) renameInputRef.current?.focus();
  }, [renameId]);

  // Clean up empty active conversation, then create a new one
  const handleNewChat = () => {
    if (activeConversationId) {
      const active = conversations.find((c) => c.id === activeConversationId);
      if (active && active.messages.length === 0) {
        deleteConversation(activeConversationId);
      }
    }
    createConversation();
  };

  // Clean up empty active conversation, then switch
  const handleSwitch = (id: string) => {
    if (id === activeConversationId) return;
    if (activeConversationId) {
      const active = conversations.find((c) => c.id === activeConversationId);
      if (active && active.messages.length === 0) {
        deleteConversation(activeConversationId);
      }
    }
    setActiveConversation(id);
  };

  const openRename = (id: string, currentTitle: string) => {
    setRenameId(id);
    setRenameValue(currentTitle || "New conversation");
  };

  const handleRename = () => {
    const trimmed = renameValue.trim();
    if (!trimmed || !renameId) return;
    renameConversation(renameId, trimmed);
    setRenameId(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const remaining = conversations.filter((c) => c.id !== deleteId);
    const wasActive = deleteId === activeConversationId;
    deleteConversation(deleteId);
    setDeleteId(null);
    if (wasActive) {
      if (remaining.length > 0) {
        const mostRecent = [...remaining].sort((a, b) => b.updatedAt - a.updatedAt)[0];
        setActiveConversation(mostRecent.id);
      } else {
        createConversation();
      }
    }
  };

  const deleteTarget = conversations.find((c) => c.id === deleteId);

  return (
    <>
      <aside className="w-60 bg-surface border-r border-border flex flex-col p-3 gap-1.5 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-1.5 pb-3 mb-1 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center text-white shadow-lg shadow-accent-glow">
            <MessageCircle size={16} />
          </div>
          <span className="text-sm font-semibold tracking-tight">Thoughts2Code</span>
        </div>

        {/* New Chat */}
        <button
          onClick={handleNewChat}
          className="w-full py-2 px-3 rounded-lg bg-surface-2 border border-border text-xs text-gray-400 hover:bg-accent-soft hover:border-accent-glow hover:text-accent transition-colors"
        >
          <Plus size={12} className="inline-block mr-1" /> New Chat
        </button>

        {/* History */}
        <div className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 px-2 pt-3 pb-1">
          History
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5">
          {conversations.length === 0 && (
            <div className="text-xs text-gray-600 italic px-2 py-1">No conversations yet</div>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group relative flex items-center rounded-lg transition-colors ${
                conv.id === activeConversationId
                  ? "bg-accent-soft border border-accent-glow"
                  : "hover:bg-surface-2 border border-transparent"
              }`}
            >
              {/* Title button */}
              <button
                onClick={() => handleSwitch(conv.id)}
                className="flex-1 text-left px-2.5 py-1.5 text-xs truncate pr-14"
                style={{ color: conv.id === activeConversationId ? "var(--color-accent)" : undefined }}
              >
                <span className={conv.id !== activeConversationId ? "text-gray-400" : ""}>
                  {conv.title || "New conversation"}
                </span>
              </button>

              {/* Rename + Delete buttons (visible on hover or when active) */}
              <div className="absolute right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); openRename(conv.id, conv.title); }}
                  className="p-1 rounded text-gray-500 hover:text-accent hover:bg-accent-soft transition-colors"
                  title="Rename"
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086zM11.189 6.25 9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.25.25 0 0 0 .108-.064L11.19 6.25z"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(conv.id); }}
                  className="p-1 rounded text-gray-500 hover:text-danger hover:bg-[rgba(220,79,55,0.1)] transition-colors"
                  title="Delete"
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="border-t border-border pt-2.5 flex flex-col gap-1.5 relative">
          {/* Settings popover */}
          {settingsOpen && (
            
            <div
              className="absolute bottom-full left-0 mb-2 w-72 bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-xl z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Theme section */}
              <div className="text-sm font-semibold">Settings</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Theme</span>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 bg-surface-2 border border-border hover:border-accent-glow hover:text-accent transition-colors"
                >
                  {theme === "dark" ? <><Sun size={12} />Light mode</> : <><Moon size={12} />Dark mode</>}
                </button>
              </div>

              {/* Difficulty section */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-400">Difficulty</span>
                <div className="flex rounded-lg overflow-hidden border border-border text-xs">
                  <button
                    onClick={() => setDifficulty("light")}
                    className={`flex-1 py-1.5 transition-colors ${
                      difficulty === "light"
                        ? "bg-accent text-white"
                        : "bg-surface-2 text-gray-400 hover:text-accent"
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setDifficulty("strict")}
                    className={`flex-1 py-1.5 transition-colors ${
                      difficulty === "strict"
                        ? "bg-accent text-white"
                        : "bg-surface-2 text-gray-400 hover:text-accent"
                    }`}
                  >
                    Strict
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 leading-snug">
                  {difficulty === "strict"
                    ? "No hints upfront - you'll be challenged to think it through first."
                    : "Guided hints and suggestions to help you along."}
                </p>
              </div>
              
              {/* Font section */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-400">Font</span>
                {(["arial", "verdana", "opendyslexic"] as const).map((f) => (
                  <label key={f} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="font"
                      checked={font === f}
                      onChange={() => setFont(f)}
                      className="accent-[var(--color-accent)]"
                    />
                    <span
                      className="text-sm text-[var(--color-text)]"
                      style={{
                        fontFamily:
                          f === "arial" ? "Arial, Helvetica, sans-serif" :
                          f === "verdana" ? "Verdana, Geneva, Tahoma, sans-serif" :
                          "OpenDyslexic, Arial, sans-serif",
                      }}
                    >
                      {f === "arial" ? "Arial" : f === "verdana" ? "Verdana" : "OpenDyslexic"}
                    </span>
                  </label>
                ))}
              </div>
                {/* Font size section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Text Size</span>
                  <span className="text-xs text-gray-500">{fontSize}pt</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={18}
                  step={1}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-[var(--color-accent)]"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-surface-2 transition-colors"
          >
            <Settings size={12} className="inline-block mr-1.5" />Settings
          </button>
        </div>
      </aside>

      {/* Rename modal */}
      {renameId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setRenameId(null)}>
          <div
            className="bg-surface border border-border rounded-2xl p-5 w-80 flex flex-col gap-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-semibold">Rename conversation</div>
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenameId(null); }}
              maxLength={100}
              className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-sm text-[var(--color-input-text)] placeholder-gray-500 focus:outline-none focus:border-accent-glow transition-colors"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRenameId(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                disabled={!renameValue.trim()}
                className="px-3 py-1.5 rounded-lg text-xs bg-accent text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click-outside overlay to close settings popover */}
      {settingsOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteId(null)}>
          <div
            className="bg-surface border border-border rounded-2xl p-5 w-80 flex flex-col gap-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-semibold">Delete conversation?</div>
            <div className="text-xs text-gray-400 leading-relaxed">
              <span className="text-[var(--color-text)]">"{deleteTarget?.title || "New conversation"}"</span>
              {" "}will be permanently deleted. This cannot be undone.
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 rounded-lg text-xs bg-danger text-white hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
