"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAIAssistantStore, type ChatMessage } from "@/stores";
import { cn } from "@/lib/utils";
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  BarChart3,
  AlertTriangle,
  Package,
  ShoppingCart,
  Factory,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Suggested Questions ────────────────────────────────

const SUGGESTED_QUESTIONS = [
  {
    label: "Daily Summary",
    message: "Give me today's business summary",
    icon: BarChart3,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  {
    label: "Inventory Risks",
    message: "Which products are low in stock?",
    icon: Package,
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
  },
  {
    label: "Operational Risks",
    message: "What are the biggest operational risks right now?",
    icon: AlertTriangle,
    color: "bg-red-500/10 text-red-600 border-red-200",
  },
  {
    label: "Procurement Advice",
    message: "What should be procured today?",
    icon: ShoppingCart,
    color: "bg-green-500/10 text-green-600 border-green-200",
  },
  {
    label: "Manufacturing Status",
    message: "Are any manufacturing orders blocked?",
    icon: Factory,
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
  },
  {
    label: "Business Overview",
    message: "How is the business doing overall?",
    icon: Sparkles,
    color: "bg-pink-500/10 text-pink-600 border-pink-200",
  },
];

// ─── Markdown-light Renderer ────────────────────────────

function RenderMarkdown({ content }: { content: string }) {
  // Simple markdown-to-JSX renderer for AI responses
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={i} className="font-semibold text-[13px] text-[#1A1A1A] mt-3 mb-1">
          {trimmed.slice(4)}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={i} className="font-bold text-sm text-[#1A1A1A] mt-3 mb-1">
          {trimmed.slice(3)}
        </h3>
      );
      return;
    }

    // Bold text
    const renderInline = (text: string) => {
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="font-semibold text-[#1A1A1A]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };

    // List items
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.match(/^\d+\.\s/)) {
      inList = true;
      const text = trimmed.replace(/^[-*]\s/, "").replace(/^\d+\.\s/, "");
      listItems.push(
        <li key={i} className="text-[13px] text-[#404040]">
          {renderInline(text)}
        </li>
      );
      return;
    }

    // Arrow workflow traces
    if (trimmed.includes("→") || trimmed.includes("↓")) {
      flushList();
      elements.push(
        <div
          key={i}
          className="text-[12px] font-mono bg-[#F5F2F8] rounded px-2 py-1 my-1 text-[#820AD1]"
        >
          {trimmed}
        </div>
      );
      return;
    }

    // Empty lines
    if (trimmed === "") {
      flushList();
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={i} className="text-[13px] text-[#404040] my-1">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-0.5">{elements}</div>;
}

// ─── Chat Message Bubble ────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2.5 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          isUser ? "bg-[#820AD1]" : "bg-gradient-to-br from-[#820AD1] to-[#E040FB]"
        )}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5",
          isUser
            ? "bg-[#820AD1] text-white rounded-tr-md"
            : "bg-white border border-[#E8E0F0] rounded-tl-md shadow-sm"
        )}
      >
        {isUser ? (
          <p className="text-[13px]">{message.content}</p>
        ) : (
          <RenderMarkdown content={message.content} />
        )}
        <p
          className={cn(
            "text-[10px] mt-1.5",
            isUser ? "text-white/60" : "text-[#999]"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Thinking Indicator ─────────────────────────────────

function ThinkingIndicator() {
  return (
    <div className="flex gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-[#820AD1] to-[#E040FB]">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white border border-[#E8E0F0] rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-[#820AD1] animate-spin" />
          <span className="text-[13px] text-[#820AD1] font-medium">
            Analyzing your ERP data...
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Chat Panel ────────────────────────────────────

export function AIChatPanel() {
  const {
    isOpen,
    setOpen,
    messages,
    isLoading,
    addMessage,
    setLoading,
    clearMessages,
  } = useAIAssistantStore();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      addMessage(userMessage);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim() }),
        });

        const data = await res.json();

        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response || data.error || "No response received.",
          timestamp: new Date(),
          intent: data.intent,
          contextType: data.contextType,
        };

        addMessage(aiMessage);
      } catch {
        addMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "❌ **Connection Error**\n\nCould not reach the AI server. Please check your internet connection and try again.",
          timestamp: new Date(),
        });
      } finally {
        setLoading(false);
      }
    },
    [isLoading, addMessage, setLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-screen z-50 flex flex-col transition-transform duration-300 ease-in-out",
          "w-[440px] bg-[#FAFAFA] border-l border-[#E0E0E0] shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E0F0] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#820AD1] to-[#E040FB] flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A1A1A]">ERP Copilot</h2>
              <p className="text-[10px] text-[#999]">
                Powered by Gemini AI • Real-time ERP data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearMessages}
                className="w-8 h-8 text-[#999] hover:text-[#E53935]"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="w-8 h-8 text-[#999] hover:text-[#1A1A1A]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 erp-scrollbar">
          {messages.length === 0 && !isLoading ? (
            // Welcome + Suggested Questions
            <div className="space-y-5">
              <div className="text-center pt-6 pb-2">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#820AD1] to-[#E040FB] flex items-center justify-center shadow-lg mb-4">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-base font-bold text-[#1A1A1A]">
                  ERP Copilot
                </h3>
                <p className="text-[12px] text-[#777] mt-1 max-w-[280px] mx-auto">
                  I analyze your real ERP data to answer questions about
                  inventory, sales, procurement, manufacturing, and more.
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2 px-1">
                  Quick Questions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => {
                    const Icon = q.icon;
                    return (
                      <button
                        key={q.label}
                        onClick={() => sendMessage(q.message)}
                        className={cn(
                          "flex items-start gap-2 p-3 rounded-xl border text-left transition-all duration-200",
                          "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                          q.color
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="text-[12px] font-medium leading-tight">
                          {q.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#F5F2F8] rounded-xl px-4 py-3">
                <p className="text-[11px] text-[#666] leading-relaxed">
                  💡 <strong>Tip:</strong> You can ask about specific orders
                  like{" "}
                  <button
                    className="text-[#820AD1] font-semibold hover:underline"
                    onClick={() => sendMessage("Explain SO-1WWR6H")}
                  >
                    &quot;Explain SO-1WWR6H&quot;
                  </button>{" "}
                  or ask general questions like{" "}
                  <button
                    className="text-[#820AD1] font-semibold hover:underline"
                    onClick={() =>
                      sendMessage("Why did inventory decrease?")
                    }
                  >
                    &quot;Why did inventory decrease?&quot;
                  </button>
                </p>
              </div>
            </div>
          ) : (
            // Chat Messages
            <div>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <ThinkingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#E8E0F0] bg-white px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about inventory, orders, risks..."
              disabled={isLoading}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl text-[13px]",
                "bg-[#F5F2F8] border border-[#E8E0F0]",
                "focus:outline-none focus:ring-2 focus:ring-[#820AD1]/30 focus:border-[#820AD1]",
                "placeholder:text-[#999] text-[#1A1A1A]",
                "disabled:opacity-50"
              )}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-[#820AD1] hover:bg-[#9013D8] rounded-xl px-3 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
