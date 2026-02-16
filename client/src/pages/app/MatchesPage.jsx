import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Search, Clock } from "lucide-react";
import { useMatchStore } from "../../store/matchStore.js";
import { useChatStore } from "../../store/chatStore.js";
import Spinner from "../../components/ui/Spinner.jsx";

// ── Time formatter ────────────────────────────────────────
const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
};

// ── New Match Card (no messages yet) ─────────────────────
const NewMatchCard = ({ match, onClick }) => {
  const user = match.user;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-rose-500/50 group-hover:border-rose-500 transition-all">
          {user?.photos?.[0]?.url ? (
            <img
              src={user.photos[0].url}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-2xl">
              👤
            </div>
          )}
        </div>
        {/* Online indicator */}
        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
      </div>
      <span className="text-zinc-300 text-xs font-medium truncate max-w-16">
        {user?.name?.split(" ")[0]}
      </span>
    </button>
  );
};

// ── Conversation Row ──────────────────────────────────────
const ConversationRow = ({ match, onClick }) => {
  const user = match.user;
  const lastMsg = match.lastMessage;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl
        hover:bg-zinc-900/80 transition-all duration-200 text-left group"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-zinc-700 transition-all">
          {user?.photos?.[0]?.url ? (
            <img
              src={user.photos[0].url}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-2xl">
              👤
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-white font-semibold text-sm truncate">
            {user?.name}
          </span>
          {lastMsg && (
            <span className="text-zinc-600 text-xs shrink-0 ml-2">
              {formatTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p
            className={`text-xs truncate ${
              match.unreadCount > 0
                ? "text-zinc-200 font-medium"
                : "text-zinc-500"
            }`}
          >
            {lastMsg ? lastMsg.content : "💬 Say hello!"}
          </p>
          {match.unreadCount > 0 && (
            <span className="ml-2 shrink-0 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-semibold">
              {match.unreadCount > 9 ? "9+" : match.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ── Main Matches Page ─────────────────────────────────────
const MatchesPage = () => {
  const navigate = useNavigate();
  const { matches, fetchMatches, isLoading } = useMatchStore();
  const { fetchConversations, conversations } = useChatStore();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("messages"); // matches | messages

  useEffect(() => {
    fetchMatches();
    fetchConversations();
  }, []);

  // New matches = matched but no messages yet
  const newMatches = matches.filter((m) => !m.lastMessage);
  const withMessages = conversations.filter((c) => c.lastMessage);

  const filteredConversations = withMessages.filter((c) =>
    c.user?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredNewMatches = newMatches.filter((m) =>
    m.user?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-6 md:pt-16">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2 md:px-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="text-rose-500" size={24} />
          <h1 className="text-white font-black text-xl">Matches</h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            placeholder="Search matches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl
              pl-9 pr-4 py-2.5 text-white text-sm placeholder-zinc-600
              outline-none focus:border-zinc-700 transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
          {[
            { key: "messages", label: "Messages", count: withMessages.length },
            { key: "matches", label: "New Matches", count: newMatches.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? "bg-white/20" : "bg-zinc-800"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="px-4 md:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : activeTab === "matches" ? (
          // New matches grid
          filteredNewMatches.length > 0 ? (
            <div className="flex flex-wrap gap-4 pt-4">
              {filteredNewMatches.map((match) => (
                <NewMatchCard
                  key={match.matchId}
                  match={match}
                  onClick={() => navigate(`/chat/${match.matchId}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="💝"
              title="No new matches yet"
              subtitle="Keep swiping to find your match!"
              action={{ label: "Discover", onClick: () => navigate("/") }}
            />
          )
        ) : // Conversations list
        filteredConversations.length > 0 ? (
          <div className="flex flex-col mt-2">
            {filteredConversations.map((convo) => (
              <ConversationRow
                key={convo.matchId}
                match={convo}
                onClick={() => navigate(`/chat/${convo.matchId}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="💬"
            title="No conversations yet"
            subtitle="Match with someone and say hello!"
            action={{ label: "Find Matches", onClick: () => navigate("/") }}
          />
        )}
      </div>
    </div>
  );
};

// ── Empty state helper ────────────────────────────────────
const EmptyState = ({ icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-5xl mb-4">{icon}</span>
    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
    <p className="text-zinc-500 text-sm mb-6 max-w-xs">{subtitle}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-6 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30
          text-rose-400 text-sm font-semibold hover:bg-rose-500/20 transition-all"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default MatchesPage;
