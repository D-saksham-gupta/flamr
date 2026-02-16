import { X, SlidersHorizontal } from "lucide-react";
import Button from "../ui/Button.jsx";

const FilterDrawer = ({ isOpen, onClose, filters, onChange, onApply }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-3xl md:rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-rose-400" />
            <h3 className="text-white font-bold text-lg">Filters</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Age Range */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-zinc-300">
                Age Range
              </label>
              <span className="text-rose-400 text-sm font-semibold">
                {filters.ageMin}–{filters.ageMax}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-zinc-600 mb-1">Min</p>
                <input
                  type="range"
                  min={18}
                  max={80}
                  value={filters.ageMin}
                  onChange={(e) => onChange("ageMin", parseInt(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-600 mb-1">Max</p>
                <input
                  type="range"
                  min={18}
                  max={80}
                  value={filters.ageMax}
                  onChange={(e) => onChange("ageMax", parseInt(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Distance */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-zinc-300">
                Distance
              </label>
              <span className="text-rose-400 text-sm font-semibold">
                {filters.distance} km
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={filters.distance}
              onChange={(e) => onChange("distance", parseInt(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-xs text-zinc-600 mt-1">
              <span>5 km</span>
              <span>200 km</span>
            </div>
          </div>

          {/* Show Me */}
          <div>
            <label className="text-sm font-semibold text-zinc-300 block mb-3">
              Show Me
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["men", "women", "everyone"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => onChange("showMe", opt)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border capitalize transition-all ${
                    filters.showMe === opt
                      ? "bg-rose-500/15 border-rose-500 text-rose-400"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced filters */}
          <div className="border-t border-zinc-800 pt-5">
            <p className="text-xs text-zinc-600 font-semibold uppercase tracking-wider mb-4">
              Advanced
            </p>

            {/* Religion */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-sm text-zinc-400">Religion</label>
              <input
                type="text"
                placeholder="Any"
                value={filters.religion || ""}
                onChange={(e) => onChange("religion", e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-rose-500/50 placeholder-zinc-600"
              />
            </div>

            {/* Drinking */}
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-sm text-zinc-400">Drinking</label>
              <div className="flex gap-2">
                {["", "never", "sometimes", "often"].map((v) => (
                  <button
                    key={v}
                    onClick={() => onChange("drinking", v)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border capitalize transition-all ${
                      filters.drinking === v
                        ? "bg-rose-500/15 border-rose-500 text-rose-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500"
                    }`}
                  >
                    {v || "Any"}
                  </button>
                ))}
              </div>
            </div>

            {/* Smoking */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400">Smoking</label>
              <div className="flex gap-2">
                {["", "never", "sometimes", "often"].map((v) => (
                  <button
                    key={v}
                    onClick={() => onChange("smoking", v)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border capitalize transition-all ${
                      filters.smoking === v
                        ? "bg-rose-500/15 border-rose-500 text-rose-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500"
                    }`}
                  >
                    {v || "Any"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Apply */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              onChange("reset", null);
            }}
            className="px-4 py-3 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-all"
          >
            Reset
          </button>
          <Button size="lg" className="flex-1" onClick={onApply}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;
