import { useState, useEffect, useRef, useCallback } from "react";
import { getSocket } from "../../lib/socket.js";
import { useChatStore } from "../../store/chatStore.js";
import { useAuthStore } from "../../store/authStore.js";
import { chatAPI } from "../../api/chat.api.js";
import MessageBubble from "./MessageBubble.jsx";
import { Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const TYPING_DEBOUNCE = 1500;

const ChatWindow = ({ matchId, otherUser }) => {
  const { user } = useAuthStore();
  const { messages, fetchMessages, addMessage, markAllSeen, isLoading } =
    useChatStore();

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const bottomRef = useRef(null);
  const typingTimerRef = useRef(null);
  const containerRef = useRef(null);
  const socket = getSocket();

  const matchMessages = messages[matchId] || [];

  // ── Join match room ───────────────────────────────────────
  useEffect(() => {
    if (!socket || !matchId) return;
    socket.emit("join_match", { matchId });
    return () => socket.emit("leave_match", { matchId });
  }, [matchId, socket]);

  // ── Fetch initial messages ────────────────────────────────
  useEffect(() => {
    if (!matchId) return;
    fetchMessages(matchId, 1).then(() => {
      setTimeout(() => scrollToBottom("auto"), 100);
    });
    markSeen();
  }, [matchId]);

  // ── Auto scroll on new messages ───────────────────────────
  useEffect(() => {
    if (matchMessages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [matchMessages.length]);

  // ── Typing listener ───────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.on("user_typing", ({ matchId: mId }) => {
      if (mId === matchId) setIsTyping(true);
    });
    socket.on("user_stopped_typing", ({ matchId: mId }) => {
      if (mId === matchId) setIsTyping(false);
    });
    return () => {
      socket.off("user_typing");
      socket.off("user_stopped_typing");
    };
  }, [matchId, socket]);

  const scrollToBottom = (behavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  const markSeen = async () => {
    try {
      await chatAPI.markAsSeen(matchId);
      markAllSeen(matchId);
      socket?.emit("mark_seen", { matchId });
    } catch (_) {}
  };

  // ── Load older messages on scroll to top ─────────────────
  const handleScroll = async () => {
    const container = containerRef.current;
    if (!container || loadingMore || !hasMore) return;
    if (container.scrollTop < 60) {
      setLoadingMore(true);
      const nextPage = page + 1;
      try {
        const res = await chatAPI.getMessages(matchId, { page: nextPage });
        const older = res.data.data.messages;
        if (older.length === 0) {
          setHasMore(false);
        } else {
          const prevHeight = container.scrollHeight;
          await fetchMessages(matchId, nextPage);
          setPage(nextPage);
          // Maintain scroll position
          setTimeout(() => {
            container.scrollTop = container.scrollHeight - prevHeight;
          }, 50);
        }
      } catch (_) {}
      setLoadingMore(false);
    }
  };

  // ── Typing emit ───────────────────────────────────────────
  const handleTyping = (value) => {
    setInput(value);
    if (!socket) return;
    socket.emit("typing_start", { matchId });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing_stop", { matchId });
    }, TYPING_DEBOUNCE);
  };

  // ── Send message ──────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || isSending) return;

    // Optimistic update
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      matchId,
      sender: { _id: user._id, name: user.name, photos: user.photos },
      content,
      status: "sending",
      createdAt: new Date().toISOString(),
    };

    addMessage(matchId, tempMsg);
    setInput("");
    setIsSending(true);

    // Stop typing
    socket?.emit("typing_stop", { matchId });
    clearTimeout(typingTimerRef.current);

    try {
      const res = await chatAPI.sendMessage(matchId, { content });
      const realMsg = res.data.data.message;

      // Replace temp message with real one
      const store = useChatStore.getState();
      const updated = (store.messages[matchId] || []).map((m) =>
        m._id === tempMsg._id ? realMsg : m,
      );
      useChatStore.setState((s) => ({
        messages: { ...s.messages, [matchId]: updated },
      }));
    } catch (err) {
      toast.error("Failed to send message");
      // Remove temp message
      const store = useChatStore.getState();
      const filtered = (store.messages[matchId] || []).filter(
        (m) => m._id !== tempMsg._id,
      );
      useChatStore.setState((s) => ({
        messages: { ...s.messages, [matchId]: filtered },
      }));
      setInput(content);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, matchId, user, socket]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Group messages by date ────────────────────────────────
  const groupedMessages = matchMessages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: "long", day: "numeric" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Messages area ──────────────────────────────────── */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scroll-smooth"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#27272a transparent",
        }}
      >
        {/* Load more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-3">
            <Loader2 size={18} className="text-zinc-500 animate-spin" />
          </div>
        )}

        {isLoading && matchMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="text-zinc-500 animate-spin" />
          </div>
        ) : matchMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-700 mb-4">
              {otherUser?.photos?.[0]?.url ? (
                <img
                  src={otherUser.photos[0].url}
                  alt={otherUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-2xl">
                  👤
                </div>
              )}
            </div>
            <p className="text-white font-semibold mb-1">
              You matched with {otherUser?.name}!
            </p>
            <p className="text-zinc-500 text-sm">
              Say something nice to break the ice 👋
            </p>
          </div>
        ) : (
          // Grouped messages
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date label */}
              <div className="flex items-center justify-center my-4">
                <span className="text-zinc-600 text-xs bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                  {formatDateLabel(date)}
                </span>
              </div>

              <div className="space-y-1">
                {msgs.map((msg, idx) => {
                  const isOwn =
                    msg.sender?._id === user?._id || msg.sender === user?._id;
                  const prevMsg = msgs[idx - 1];
                  const showAvatar =
                    !isOwn &&
                    (!prevMsg || prevMsg.sender?._id !== msg.sender?._id);

                  return (
                    <MessageBubble
                      key={msg._id}
                      message={msg}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      senderPhoto={otherUser?.photos?.[0]?.url}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-700 shrink-0">
              {otherUser?.photos?.[0]?.url ? (
                <img
                  src={otherUser.photos[0].url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-700" />
              )}
            </div>
            <div className="bg-zinc-800 border border-zinc-700/50 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ─────────────────────────────────────── */}
      <div className="shrink-0 border-t border-zinc-800 bg-black px-4 py-3">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              maxLength={1000}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl
                px-4 py-3 pr-4 text-white text-sm placeholder-zinc-600
                outline-none focus:border-zinc-700 resize-none
                transition-colors leading-relaxed"
              style={{
                minHeight: "44px",
                maxHeight: "120px",
                overflowY: input.split("\n").length > 3 ? "auto" : "hidden",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            className="
              w-11 h-11 rounded-full shrink-0
              bg-linear-to-br from-rose-500 to-orange-500
              flex items-center justify-center
              text-white shadow-lg shadow-rose-500/20
              hover:from-rose-600 hover:to-orange-600
              transition-all duration-200 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {isSending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <p className="text-right text-xs text-zinc-700 mt-1 pr-14">
          {input.length > 0 && `${input.length}/1000`}
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
