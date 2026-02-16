import { NavLink, useNavigate } from "react-router-dom";
import { Flame, Heart, MessageCircle, User } from "lucide-react";
import { useAuthStore } from "../../store/authStore.js";
import { useChatStore } from "../../store/chatStore.js";

const Navbar = () => {
  const { logout } = useAuthStore();
  const { conversations } = useChatStore();
  const navigate = useNavigate();

  const totalUnread = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0),
    0,
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/", icon: Flame, label: "Discover" },
    { to: "/matches", icon: Heart, label: "Matches" },
    { to: "/matches", icon: MessageCircle, label: "Chats", badge: totalUnread },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-zinc-800 px-2 py-2 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-lg mx-auto flex items-center justify-around md:justify-between md:px-6">
        {/* Logo (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <Flame className="text-rose-500" size={28} />
          <span className="text-white font-bold text-xl">Flamr</span>
        </div>

        {/* Nav items */}
        <div className="flex items-center gap-1 md:gap-4">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all
                ${
                  isActive
                    ? "text-rose-500"
                    : "text-zinc-500 hover:text-zinc-300"
                }`
              }
            >
              <div className="relative">
                <Icon size={24} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-xs hidden md:block">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Logout (desktop) */}
        <button
          onClick={handleLogout}
          className="hidden md:block text-zinc-500 hover:text-rose-400 text-sm transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
