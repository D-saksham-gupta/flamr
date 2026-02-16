import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { useAuthStore } from "../../store/authStore.js";
import { connectSocket } from "../../lib/socket.js";

const SplashScreen = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className="w-20 h-20 rounded-2xl bg-linear-to-br from-rose-500 to-orange-500
          flex items-center justify-center shadow-2xl shadow-rose-500/30"
        >
          <Flame size={40} className="text-white" />
        </div>
        <div
          className="absolute inset-0 rounded-2xl bg-linear-to-br
          from-rose-500 to-orange-500 animate-ping opacity-20"
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-white font-black text-3xl tracking-tight">
          flamr
        </span>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AppInitializer = ({ children }) => {
  const { token, fetchMe, isAuthenticated } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (token) {
          await fetchMe();
          connectSocket(token);
        }
      } catch (_) {
      } finally {
        // Min splash duration for smooth UX
        setTimeout(() => setIsInitializing(false), 800);
      }
    };
    init();
  }, []);

  if (isInitializing) return <SplashScreen />;
  return children;
};

export default AppInitializer;
