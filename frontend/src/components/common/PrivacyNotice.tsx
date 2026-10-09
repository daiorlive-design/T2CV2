import { useEffect, useRef, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { getParticipantId } from "../../utils/participant";

/**
 * Privacy notice shown before the participant can use the chat.
 * Accepted once per participant code in this browser; a new code (?p=...) shows it again.
 */

const STORAGE_KEY = "thoughts2code-privacy-accepted";

function acceptedKeyValue(): string {
  return getParticipantId() || "no-code";
}

function hasAccepted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === acceptedKeyValue();
  } catch {
    return false;
  }
}

export function PrivacyNotice() {
  const [open, setOpen] = useState(() => !hasAccepted());
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) buttonRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, acceptedKeyValue());
    } catch {
      // ignore: the notice will simply show again next time
    }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl text-sm leading-relaxed"
      >
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert size={24} className="text-warning flex-shrink-0" />
          <h2 id="privacy-title" className="text-lg font-semibold">
            Before you start: please don't share personal information
          </h2>
        </div>

        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>
            Your messages are sent to an external AI service (OpenRouter and the company that runs the
            AI model) to create the answers.
          </li>
          <li>
            We have no control over how these companies store or use your messages. This may include
            using them to train their AI models.
          </li>
          <li>
            Your conversations are also saved for this research study, identified only by your
            participant code.
          </li>
            <li>
               The AI can make mistakes. Always check its answers and code before you use or trust them.
             </li>
        </ul>

        <p className="mb-2 font-medium">Please do not type:</p>
        <p className="mb-5 text-gray-400">
          your name, email, phone number, address, ID or student numbers, passwords, or details about
          your health or about other people. If an example needs a name, make one up.
        </p>

        <button
          ref={buttonRef}
          onClick={accept}
          className="w-full rounded-xl bg-gradient-to-br from-accent to-accent-bright px-4 py-2.5 font-semibold text-white shadow-lg shadow-accent-glow"
        >
          I understand
        </button>
      </div>
    </div>
  );
}
