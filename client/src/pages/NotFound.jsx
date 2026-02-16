import { useNavigate } from "react-router-dom";
import { Flame, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-96 h-96 bg-rose-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative text-center max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Flame className="text-rose-500" size={28} />
          <span className="text-white font-black text-2xl">flamr</span>
        </div>

        {/* 404 */}
        <div className="mb-6">
          <p
            className="text-[120px] font-black leading-none
            text-transparent bg-clip-text
            bg-linear-to-b from-zinc-600 to-zinc-900"
          >
            404
          </p>
        </div>

        <h2 className="text-white font-bold text-xl mb-3">
          This page ghosted you 👻
        </h2>
        <p className="text-zinc-500 text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
              bg-linear-to-r from-rose-500 to-orange-500 text-white font-semibold
              hover:from-rose-600 hover:to-orange-600 transition-all active:scale-95"
          >
            <Home size={18} />
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
              bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold
              hover:border-zinc-700 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
