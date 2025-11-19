"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface Message {
  role: "user" | "assistant" | "function";
  content: string;
  name?: string;
}

export default function AssistantPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gpt/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();
      
      setMessages((prev) => [...prev, {
        role: data.role === "function" ? "assistant" : data.role,
        content: data.role === "function" 
          ? `✅ Aktion ausgeführt: ${data.name}\n${data.content}`
          : data.content || "Keine Antwort erhalten",
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "❌ Fehler bei der Kommunikation mit dem Assistenten.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">GPT-Assistent</h1>
        <p className="text-gray-600">Bitte logge dich ein, um den Assistenten zu nutzen.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <h1 className="text-2xl font-bold mb-4">GPT-Assistent 🤖</h1>
      <p className="text-gray-600 mb-4">
        Sag mir, was ich bauen soll! Ich kann Projekte erstellen, deployen und mobile Builds starten.
      </p>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-6 mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center py-8">
            Starte eine Unterhaltung...
            <br />
            <span className="text-sm">
              Beispiel: &quot;Erstelle eine Dating App namens LoveConnect&quot;
            </span>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="animate-pulse">Denke nach...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Was soll ich bauen?"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Senden
        </button>
      </div>
    </div>
  );
}
