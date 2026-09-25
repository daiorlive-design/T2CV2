import { useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { ChatView } from "./components/chat/ChatView";
import { useChatStore } from "./stores/chatStore";

const fontFamilies = {
  arial: "Arial, Helvetica, sans-serif",
  verdana: "Verdana, Geneva, Tahoma, sans-serif",
  opendyslexic: "OpenDyslexic, Arial, sans-serif",
};

export default function App() {
  const theme = useChatStore((s) => s.theme);
  const font = useChatStore((s) => s.font);
  const fontSize = useChatStore((s) => s.fontSize);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  useEffect(() => {
    document.body.style.fontFamily = fontFamilies[font];
  }, [font]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${(fontSize * 4) / 3}px`;
  }, [fontSize]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <ChatView />
      </main>
    </div>
  );
}
