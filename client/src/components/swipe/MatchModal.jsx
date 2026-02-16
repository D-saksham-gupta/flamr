import { useNavigate } from "react-router-dom";
import { Flame, MessageCircle, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore.js";
import Button from "../ui/Button.jsx";

const MatchModal = ({ match, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!match) return null;

  const matchedUser = match.users?.find((u) => u._id !== user?._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-sm w-full">
        {/* Animated flame */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-rose-500/50 animate-pulse">
              <Flame size={40} className="text-white" />
            </div>
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-rose-500 to-orange-500 animate-ping opacity-20" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-white mb-2">It's a Match!</h1>
        <p className="text-zinc-400 text-sm mb-8">
          You and{" "}
          <span className="text-white font-semibold">{matchedUser?.name}</span>{" "}
          liked each other 🎉
        </p>

        {/* Photos */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Current user */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-rose-500 shadow-xl">
              {user?.photos?.[0]?.url ? (
                <img
                  src={user.photos[0].url}
                  alt="You"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-3xl">
                  👤
                </div>
              )}
            </div>
          </div>

          {/* Heart */}
          <div className="w-10 h-10 rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center">
            <span className="text-lg">❤️</span>
          </div>

          {/* Matched user */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-rose-500 shadow-xl">
              {matchedUser?.photos?.[0]?.url ? (
                <img
                  src={matchedUser.photos[0].url}
                  alt={matchedUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-3xl">
                  👤
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              onClose();
              navigate(`/chat/${match._id}`);
            }}
          >
            <MessageCircle size={20} />
            Send a Message
          </Button>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-sm py-2 transition-colors"
          >
            Keep Swiping
          </button>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default MatchModal;
