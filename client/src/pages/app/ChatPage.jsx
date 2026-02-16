import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Flag,
  UserX,
  Heart,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { matchAPI } from "../../api/match.api.js";
import { reportAPI } from "../../api/report.api.js";
import { useChatStore } from "../../store/chatStore.js";
import { useMatchStore } from "../../store/matchStore.js";
import ChatWindow from "../../components/chat/ChatWindow.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Button from "../../components/ui/Button.jsx";

// ── Report Modal ──────────────────────────────────────────
const ReportModal = ({ isOpen, onClose, userId }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    { value: "harassment", label: "😤 Harassment" },
    { value: "fake_profile", label: "🎭 Fake Profile" },
    { value: "inappropriate_photos", label: "🔞 Inappropriate Photos" },
    { value: "spam", label: "📨 Spam" },
    { value: "underage", label: "⚠️ Underage" },
    { value: "other", label: "📋 Other" },
  ];

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Select a reason");
      return;
    }
    setIsSubmitting(true);
    try {
      await reportAPI.reportUser({
        reportedUserId: userId,
        reason,
        description,
      });
      toast.success("Report submitted. Thank you.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-white font-bold text-lg mb-1">Report User</h3>
        <p className="text-zinc-500 text-sm mb-5">
          Select a reason for your report
        </p>

        <div className="flex flex-col gap-2 mb-4">
          {reasons.map((r) => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                reason === r.value
                  ? "bg-red-500/10 border-red-500/50 text-red-400"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <textarea
          placeholder="Additional details (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3
            text-white text-sm placeholder-zinc-600 outline-none
            focus:border-zinc-600 resize-none mb-4"
        />

        <Button
          size="lg"
          variant="danger"
          className="w-full"
          isLoading={isSubmitting}
          onClick={handleSubmit}
        >
          Submit Report
        </Button>
      </div>
    </Modal>
  );
};

// ── Main Chat Page ────────────────────────────────────────
const ChatPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { onlineUsers } = useChatStore();
  const { matches, removeMatch } = useMatchStore();

  const [otherUser, setOtherUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isUnmatching, setIsUnmatching] = useState(false);

  // Find match info
  useEffect(() => {
    const match = matches.find((m) => m.matchId === matchId);
    if (match?.user) {
      setOtherUser(match.user);
    } else {
      // Fetch from API if not in store
      matchAPI
        .getMatchById(matchId)
        .then((res) => setOtherUser(res.data.data.user))
        .catch(() => navigate("/matches"));
    }
  }, [matchId, matches]);

  const isOnline = otherUser && onlineUsers.has(otherUser._id);

  const handleUnmatch = async () => {
    setIsUnmatching(true);
    try {
      await matchAPI.unmatch(matchId);
      removeMatch(matchId);
      toast.success("Unmatched");
      navigate("/matches");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unmatch");
    } finally {
      setIsUnmatching(false);
    }
  };

  const handleBlock = async () => {
    if (!otherUser) return;
    try {
      await reportAPI.blockUser(otherUser._id);
      removeMatch(matchId);
      toast.success(`${otherUser.name} blocked`);
      navigate("/matches");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to block");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black md:pt-16">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-black">
        <button
          onClick={() => navigate("/matches")}
          className="w-9 h-9 flex items-center justify-center rounded-full
            text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Avatar + name */}
        <div
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => navigate(`/users/${otherUser?._id}`)}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-700">
              {otherUser?.photos?.[0]?.url ? (
                <img
                  src={otherUser.photos[0].url}
                  alt={otherUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  👤
                </div>
              )}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
            )}
          </div>

          <div>
            <p className="text-white font-semibold text-sm leading-tight">
              {otherUser?.name || "Loading..."}
            </p>
            <p
              className={`text-xs ${isOnline ? "text-green-400" : "text-zinc-500"}`}
            >
              {isOnline ? "Online now" : "Offline"}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-full
              text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-11 z-20 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden w-52">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/users/${otherUser?._id}`);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm"
                >
                  <Info size={16} />
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowReport(true);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-amber-400 hover:bg-zinc-800 transition-colors text-sm"
                >
                  <Flag size={16} />
                  Report
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleBlock();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-zinc-800 transition-colors text-sm"
                >
                  <UserX size={16} />
                  Block User
                </button>
                <div className="border-t border-zinc-800" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleUnmatch();
                  }}
                  disabled={isUnmatching}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-zinc-800 transition-colors text-sm disabled:opacity-50"
                >
                  <Heart size={16} />
                  Unmatch
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Chat window ────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {otherUser && <ChatWindow matchId={matchId} otherUser={otherUser} />}
      </div>

      {/* Report modal */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        userId={otherUser?._id}
      />
    </div>
  );
};

export default ChatPage;
