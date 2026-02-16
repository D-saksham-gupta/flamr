import { useState, useRef, useCallback } from "react";
import SwipeCard from "./SwipeCard.jsx";

const SWIPE_THRESHOLD = 100;
const ROTATION_FACTOR = 0.08;

const SwipeStack = ({ profiles, currentIndex, onSwipe }) => {
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);

  const startPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const visibleProfiles = profiles.slice(currentIndex, currentIndex + 3);

  // ── Drag start ────────────────────────────────────────────
  const handleDragStart = useCallback(
    (e) => {
      if (isSwiping) return;
      const clientX = e.touches?.[0]?.clientX ?? e.clientX;
      const clientY = e.touches?.[0]?.clientY ?? e.clientY;
      startPos.current = { x: clientX, y: clientY };
      setDragging(true);
    },
    [isSwiping],
  );

  // ── Drag move ─────────────────────────────────────────────
  const handleDragMove = useCallback(
    (e) => {
      if (!dragging || isSwiping) return;
      const clientX = e.touches?.[0]?.clientX ?? e.clientX;
      const clientY = e.touches?.[0]?.clientY ?? e.clientY;
      const x = clientX - startPos.current.x;
      const y = clientY - startPos.current.y;
      setDragOffset({ x, y });

      // Update indicator opacity
      const card = cardRef.current;
      if (!card) return;
      const likeEl = card.querySelector(".like-indicator");
      const passEl = card.querySelector(".pass-indicator");
      const progress = Math.min(Math.abs(x) / SWIPE_THRESHOLD, 1);
      if (likeEl) likeEl.style.opacity = x > 0 ? progress : 0;
      if (passEl) passEl.style.opacity = x < 0 ? progress : 0;
    },
    [dragging, isSwiping],
  );

  // ── Drag end ──────────────────────────────────────────────
  const handleDragEnd = useCallback(async () => {
    if (!dragging || isSwiping) return;
    setDragging(false);

    const { x } = dragOffset;

    if (Math.abs(x) >= SWIPE_THRESHOLD) {
      const action = x > 0 ? "like" : "pass";
      const direction = x > 0 ? 1 : -1;

      setIsSwiping(true);
      setDragOffset({ x: direction * window.innerWidth, y: dragOffset.y });

      setTimeout(async () => {
        setDragOffset({ x: 0, y: 0 });
        setIsSwiping(false);
        await onSwipe(visibleProfiles[0]._id, action);
      }, 350);
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
  }, [dragging, isSwiping, dragOffset, visibleProfiles, onSwipe]);

  // ── Button swipe (from action buttons) ───────────────────
  const triggerSwipe = useCallback(
    async (action) => {
      if (isSwiping || visibleProfiles.length === 0) return;
      const direction = action === "like" ? 1 : -1;
      setIsSwiping(true);
      setDragOffset({ x: direction * window.innerWidth, y: 0 });

      // Show indicator
      const card = cardRef.current;
      if (card) {
        const el = card.querySelector(
          action === "like" ? ".like-indicator" : ".pass-indicator",
        );
        if (el) el.style.opacity = 1;
      }

      setTimeout(async () => {
        setDragOffset({ x: 0, y: 0 });
        setIsSwiping(false);
        await onSwipe(visibleProfiles[0]._id, action);
      }, 350);
    },
    [isSwiping, visibleProfiles, onSwipe],
  );

  if (visibleProfiles.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      {/* Render back cards first (bottom of stack) */}
      {visibleProfiles
        .slice(1)
        .reverse()
        .map((profile, reverseIdx) => {
          const stackIdx = visibleProfiles.slice(1).length - 1 - reverseIdx;
          const scale = 1 - (stackIdx + 1) * 0.04;
          const translateY = (stackIdx + 1) * 8;

          return (
            <div
              key={profile._id}
              className="absolute inset-0"
              style={{
                transform: `scale(${scale}) translateY(${translateY}px)`,
                zIndex: visibleProfiles.length - stackIdx - 2,
                transition: "transform 0.3s ease",
              }}
            >
              <SwipeCard user={profile} />
            </div>
          );
        })}

      {/* Top card (interactive) */}
      <div
        ref={cardRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          transform: `
            translateX(${dragOffset.x}px)
            translateY(${dragOffset.y * 0.3}px)
            rotate(${dragOffset.x * ROTATION_FACTOR}deg)
          `,
          transition: dragging
            ? "none"
            : "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          zIndex: visibleProfiles.length,
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <SwipeCard user={visibleProfiles[0]} />
      </div>

      {/* Expose triggerSwipe for parent */}
      <div
        className="hidden"
        id="swipe-trigger"
        data-trigger={JSON.stringify({ triggerSwipe })}
      />
    </div>
  );
};

export { SwipeStack };
export default SwipeStack;
