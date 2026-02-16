import { useState } from "react";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Ruler,
  ChevronUp,
  ChevronDown,
  Info,
} from "lucide-react";

const SwipeCard = ({ user, style = {}, className = "", onExpand }) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const photos = user.photos || [];
  const mainPhoto = photos[photoIndex]?.url;

  const handlePhotoNav = (e, dir) => {
    e.stopPropagation();
    setPhotoIndex((prev) => {
      if (dir === "next") return Math.min(prev + 1, photos.length - 1);
      return Math.max(prev - 1, 0);
    });
  };

  return (
    <div
      style={style}
      className={`
        absolute inset-0 w-full h-full
        rounded-3xl overflow-hidden
        bg-zinc-900 border border-zinc-800
        shadow-2xl select-none
        ${className}
      `}
    >
      {/* ── Photo ──────────────────────────────────────── */}
      <div className="relative w-full h-full">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={user.name}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <span className="text-8xl">👤</span>
          </div>
        )}

        {/* Photo dots */}
        {photos.length > 1 && (
          <div className="absolute top-3 left-0 right-0 flex gap-1 px-3">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-0.5 rounded-full transition-all ${
                  i === photoIndex ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        )}

        {/* Left/Right tap zones for photo navigation */}
        {photos.length > 1 && (
          <>
            <div
              className="absolute left-0 top-0 w-1/3 h-full cursor-pointer"
              onClick={(e) => handlePhotoNav(e, "prev")}
            />
            <div
              className="absolute right-0 top-0 w-1/3 h-full cursor-pointer"
              onClick={(e) => handlePhotoNav(e, "next")}
            />
          </>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

        {/* ── Info overlay ──────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white text-2xl font-bold">
                  {user.name}, {user.age}
                </h2>
              </div>

              {/* Distance */}
              {user.distance != null && (
                <div className="flex items-center gap-1.5 text-zinc-300 text-sm mb-2">
                  <MapPin size={13} className="text-rose-400" />
                  <span>{user.distance} km away</span>
                </div>
              )}

              {/* Quick details */}
              <div className="flex flex-wrap gap-2">
                {user.jobTitle && (
                  <span className="flex items-center gap-1 bg-white/10 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full">
                    <Briefcase size={11} />
                    {user.jobTitle}
                  </span>
                )}
                {user.education && (
                  <span className="flex items-center gap-1 bg-white/10 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full">
                    <GraduationCap size={11} />
                    {user.education}
                  </span>
                )}
                {user.height && (
                  <span className="flex items-center gap-1 bg-white/10 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full">
                    <Ruler size={11} />
                    {user.height} cm
                  </span>
                )}
              </div>
            </div>

            {/* Expand button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="ml-3 w-10 h-10 bg-white/10 backdrop-blur rounded-full
                flex items-center justify-center text-white
                hover:bg-white/20 transition-colors"
            >
              {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>

          {/* Expanded bio */}
          {expanded && (
            <div className="mt-4 bg-black/60 backdrop-blur rounded-2xl p-4 border border-white/10">
              {user.bio && (
                <p className="text-zinc-200 text-sm leading-relaxed mb-3">
                  {user.bio}
                </p>
              )}
              {user.interests?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {user.interests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-rose-500/20 text-rose-300 text-xs px-2.5 py-1 rounded-full border border-rose-500/20"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
              {user.extraInfo && (
                <div className="mt-3 flex items-start gap-2">
                  <Info size={13} className="text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {user.extraInfo}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Like/Pass indicator overlays */}
        <div
          className="like-indicator absolute top-10 left-6 border-4 border-green-400
            rounded-xl px-4 py-2 rotate-[-15deg] opacity-0 transition-opacity"
        >
          <span className="text-green-400 font-black text-3xl">LIKE</span>
        </div>
        <div
          className="pass-indicator absolute top-10 right-6 border-4 border-red-400
            rounded-xl px-4 py-2 rotate-15 opacity-0 transition-opacity"
        >
          <span className="text-red-400 font-black text-3xl">NOPE</span>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
