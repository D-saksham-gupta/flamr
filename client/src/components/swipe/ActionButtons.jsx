import { X, Heart, Star, ArrowLeft } from "lucide-react";

const ActionButtons = ({ onLike, onPass, onSuperLike, disabled }) => {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Pass */}
      <button
        onClick={onPass}
        disabled={disabled}
        className="
          w-14 h-14 rounded-full
          bg-zinc-900 border-2 border-zinc-700
          flex items-center justify-center
          text-red-400 hover:bg-red-500/10 hover:border-red-500/50
          transition-all duration-200 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          shadow-lg
        "
      >
        <X size={24} strokeWidth={2.5} />
      </button>

      {/* Super Like */}
      <button
        onClick={onSuperLike}
        disabled={disabled}
        className="
          w-12 h-12 rounded-full
          bg-zinc-900 border-2 border-zinc-700
          flex items-center justify-center
          text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50
          transition-all duration-200 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          shadow-lg
        "
      >
        <Star size={20} strokeWidth={2.5} />
      </button>

      {/* Like */}
      <button
        onClick={onLike}
        disabled={disabled}
        className="
          w-14 h-14 rounded-full
          bg-linear-to-br from-rose-500 to-orange-500
          border-2 border-rose-500/50
          flex items-center justify-center
          text-white
          hover:from-rose-600 hover:to-orange-600
          transition-all duration-200 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          shadow-lg shadow-rose-500/30
        "
      >
        <Heart size={24} strokeWidth={2.5} fill="white" />
      </button>
    </div>
  );
};

export default ActionButtons;
