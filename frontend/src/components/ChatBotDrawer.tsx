import { useEffect, useRef, useState } from "react";

interface ChatBotDrawerProps {
  open: boolean;
  onClose: () => void;
}

type ChatMessage = {
  role: "user" | "model";
  text: string;
};



const ChatBotDrawer: React.FC<ChatBotDrawerProps> = ({ open, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "model", text: "How can I help you today?" },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userText = input.trim();
    if (!userText) return;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userText }],
            },
          ],
        }),
      });
      const data = await res.json();
      const modelText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "Sorry, I couldn't understand that.";
      setMessages((prev) => [
        ...prev,
        { role: "model", text: modelText },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };


  return (
  <div
    className={`fixed bottom-0 right-0 z-50 w-full max-w-sm h-[70vh] sm:h-[80vh] bg-white dark:bg-gray-900 shadow-2xl rounded-t-xl border-t border-l border-gray-200 dark:border-gray-700 transition-transform duration-300
      ${open ? "translate-y-0" : "translate-y-full"}
    `}
    style={{ boxShadow: "0 0 24px 0 rgba(80,0,120,0.15)" }}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <span className="font-semibold text-lg text-gray-900 dark:text-white">
        {import.meta.env.VITE_RESTAURANT_NAME}
      </span>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-xl"
        aria-label="Close Chatbot"
      >
        ×
      </button>
    </div>
    {/* Main flex column: chat area grows, input stays fixed */}
    <div className="flex flex-col h-[calc(70vh-56px)] sm:h-[calc(80vh-56px)]">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 text-gray-800 dark:text-gray-100 flex flex-col gap-4">
        <div className="flex justify-center italic text-gray-600 px-2 py-2">(This chat is meant for fun and isnt associated with any functionality of our site. Also no user chat is geeting saved)</div>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${
              msg.role === "user"
                ? "self-end bg-purple-600 text-white"
                : "self-start bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            } px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-line`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="self-start text-gray-400 dark:text-gray-500">
            Typing...
          </div>
        )}
      </div>
      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <form onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  </div>
  );
};

export default ChatBotDrawer;