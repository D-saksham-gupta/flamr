import { useEffect, useState, useCallback } from "react";
import { Flame, SlidersHorizontal, RefreshCw, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { useSwipeStore } from "../../store/swipeStore.js";
import { useMatchStore } from "../../store/matchStore.js";
import SwipeStack from "../../components/swipe/SwipeStack.jsx";
import ActionButtons from "../../components/swipe/ActionButtons.jsx";
import MatchModal from "../../components/swipe/MatchModal.jsx";
import FilterDrawer from "../../components/swipe/FilterDrawer.jsx";
import Spinner from "../../components/ui/Spinner.jsx";

const DEFAULT_FILTERS = {
  ageMin: 18,
  ageMax: 45,
  distance: 50,
  showMe: "everyone",
  religion: "",
  drinking: "",
  smoking: "",
};

const DiscoverPage = () => {
  const {
    profiles,
    currentIndex,
    isLoading,
    lastMatch,
    fetchProfiles,
    swipe,
    clearLastMatch,
  } = useSwipeStore();
  const { addMatch } = useMatchStore();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);

  const visibleProfiles = profiles.slice(currentIndex, currentIndex + 3);
  const hasProfiles = visibleProfiles.length > 0;

  // ── Fetch on mount ────────────────────────────────────────
  useEffect(() => {
    fetchProfiles(filters);
  }, []);

  // ── Show match modal when match occurs ────────────────────
  useEffect(() => {
    if (lastMatch) {
      addMatch({
        matchId: lastMatch._id,
        user: lastMatch.users?.find((u) => u._id !== null),
        lastMessage: null,
        lastMessageAt: null,
        matchedAt: lastMatch.createdAt,
      });
    }
  }, [lastMatch]);

  // ── Swipe handler ─────────────────────────────────────────
  const handleSwipe = useCallback(
    async (targetUserId, action) => {
      if (isSwiping) return;
      setIsSwiping(true);
      const result = await swipe(targetUserId, action);
      setIsSwiping(false);

      if (!result.success) {
        toast.error(result.message);
        return;
      }
      if (result.matched) {
        // Match modal shown via lastMatch state
      }
    },
    [isSwiping, swipe],
  );

  // ── Swipe ref handler (from SwipeStack buttons) ───────────
  const [swipeStackRef, setSwipeStackRef] = useState(null);

  const handleLike = () => {
    if (!hasProfiles || isSwiping) return;
    handleSwipe(visibleProfiles[0]._id, "like");
  };

  const handlePass = () => {
    if (!hasProfiles || isSwiping) return;
    handleSwipe(visibleProfiles[0]._id, "pass");
  };

  const handleSuperLike = () => {
    if (!hasProfiles || isSwiping) return;
    toast("⭐ Super Like sent!", { icon: "⭐" });
    handleSwipe(visibleProfiles[0]._id, "like");
  };

  // ── Filters ───────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    if (key === "reset") {
      setFilters(DEFAULT_FILTERS);
      return;
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    fetchProfiles(filters);
    toast.success("Filters applied");
  };

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-0 md:pt-16">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <Flame className="text-rose-500" size={26} />
          <h1 className="text-white font-black text-xl">Discover</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchProfiles(filters)}
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800
              flex items-center justify-center text-zinc-400
              hover:text-white hover:border-zinc-600 transition-all"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowFilters(true)}
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800
              flex items-center justify-center text-zinc-400
              hover:text-white hover:border-zinc-600 transition-all relative"
          >
            <SlidersHorizontal size={16} />
            {/* Active filter indicator */}
            {JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS) && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-black" />
            )}
          </button>
        </div>
      </div>

      {/* ── Card Area ──────────────────────────────────────── */}
      <div className="px-4 md:px-6 flex flex-col items-center gap-5">
        {/* Card stack container */}
        <div
          className="w-full max-w-sm mx-auto"
          style={{
            height: "60vh",
            minHeight: "400px",
            maxHeight: "560px",
            position: "relative",
          }}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-zinc-500 text-sm">
                  Finding matches near you...
                </p>
              </div>
            </div>
          ) : hasProfiles ? (
            <SwipeStack
              profiles={profiles}
              currentIndex={currentIndex}
              onSwipe={handleSwipe}
            />
          ) : (
            // Empty state
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} className="text-zinc-600" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  No more profiles
                </h3>
                <p className="text-zinc-500 text-sm mb-5 px-6">
                  You've seen everyone nearby. Try expanding your filters or
                  check back later.
                </p>
                <button
                  onClick={() => fetchProfiles(filters)}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl
                    bg-rose-500/10 border border-rose-500/30 text-rose-400
                    hover:bg-rose-500/20 transition-all text-sm font-semibold"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Action Buttons ──────────────────────────────── */}
        {!isLoading && hasProfiles && (
          <ActionButtons
            onLike={handleLike}
            onPass={handlePass}
            onSuperLike={handleSuperLike}
            disabled={isSwiping}
          />
        )}

        {/* Profile count indicator */}
        {!isLoading && hasProfiles && (
          <p className="text-zinc-700 text-xs">
            {profiles.length - currentIndex} profiles remaining
          </p>
        )}
      </div>

      {/* ── Match Modal ─────────────────────────────────────── */}
      {lastMatch && <MatchModal match={lastMatch} onClose={clearLastMatch} />}

      {/* ── Filter Drawer ────────────────────────────────────── */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
      />
    </div>
  );
};

export default DiscoverPage;
