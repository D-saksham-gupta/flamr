import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Edit3,
  Save,
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Ruler,
  Wine,
  Cigarette,
  Heart,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  CheckCircle2,
  Upload,
  Trash2,
  SlidersHorizontal,
  User,
  Flame,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import { userAPI } from "../../api/user.api.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";

// ── Constants ─────────────────────────────────────────────
const INTERESTS_ALL = [
  "🎵 Music",
  "🎬 Movies",
  "📚 Books",
  "✈️ Travel",
  "🍕 Food",
  "🏋️ Fitness",
  "🎮 Gaming",
  "🐾 Pets",
  "🌿 Nature",
  "🎨 Art",
  "📸 Photography",
  "🧘 Yoga",
  "🏄 Surfing",
  "🍳 Cooking",
  "💻 Tech",
  "🎭 Theatre",
  "🏃 Running",
  "🎸 Guitar",
  "🌏 Languages",
  "🧩 Puzzles",
];

const DRINKING_OPTS = [
  { value: "", label: "Prefer not to say" },
  { value: "never", label: "🚫 Never" },
  { value: "sometimes", label: "🥂 Sometimes" },
  { value: "often", label: "🍺 Often" },
];

const SMOKING_OPTS = [
  { value: "", label: "Prefer not to say" },
  { value: "never", label: "🚭 Never" },
  { value: "sometimes", label: "🌬️ Sometimes" },
  { value: "often", label: "🚬 Often" },
];

// ── Section wrapper ────────────────────────────────────────
const Section = ({ title, icon: Icon, children, action }) => (
  <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={16} className="text-rose-400" />}
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ── Photo Grid ─────────────────────────────────────────────
const PhotoGrid = ({ photos, onAdd, onDelete, isEditing }) => {
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      toast.error("Maximum 5 photos");
      return;
    }
    const fd = new FormData();
    files.forEach((f) => fd.append("photos", f));
    await onAdd(fd);
    e.target.value = "";
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 5 }).map((_, i) => {
        const photo = photos[i];
        return (
          <div
            key={i}
            className={`relative aspect-3/4 rounded-xl overflow-hidden border-2
              ${photo ? "border-zinc-700" : "border-dashed border-zinc-800 bg-zinc-900/50"}`}
          >
            {photo ? (
              <>
                <img
                  src={photo.url}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {i === 0 && (
                  <span
                    className="absolute bottom-1 left-1 bg-rose-500 text-white
                    text-xs px-1.5 py-0.5 rounded-md font-semibold"
                  >
                    Main
                  </span>
                )}
                {isEditing && (
                  <button
                    onClick={() => onDelete(photo.publicId)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full
                      flex items-center justify-center text-white
                      hover:bg-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </>
            ) : (
              isEditing && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center
                    text-zinc-600 hover:text-zinc-400 transition-colors gap-1"
                >
                  <Camera size={18} />
                  <span className="text-xs">Add</span>
                </button>
              )
            )}
          </div>
        );
      })}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFile}
      />

      {isEditing && photos.length < 5 && (
        <button
          onClick={() => fileRef.current?.click()}
          className="col-span-3 flex items-center justify-center gap-2
            py-3 rounded-xl border-2 border-dashed border-zinc-800
            text-zinc-500 hover:border-rose-500/40 hover:text-rose-400
            transition-all text-sm font-medium mt-1"
        >
          <Upload size={16} />
          Upload Photos
        </button>
      )}
    </div>
  );
};

// ── Discovery Settings Modal ───────────────────────────────
const DiscoveryModal = ({ isOpen, onClose, settings, onSave }) => {
  const [form, setForm] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(form);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <SlidersHorizontal size={18} className="text-rose-400" />
          <h3 className="text-white font-bold text-lg">Discovery Settings</h3>
        </div>

        <div className="flex flex-col gap-5">
          {/* Age range */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-zinc-400">Age Range</span>
              <span className="text-rose-400 text-sm font-semibold">
                {form.ageMin}–{form.ageMax}
              </span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs text-zinc-600 mb-1">Min</p>
                <input
                  type="range"
                  min={18}
                  max={80}
                  value={form.ageMin}
                  onChange={(e) =>
                    setForm({ ...form, ageMin: parseInt(e.target.value) })
                  }
                  className="w-full accent-rose-500"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-600 mb-1">Max</p>
                <input
                  type="range"
                  min={18}
                  max={80}
                  value={form.ageMax}
                  onChange={(e) =>
                    setForm({ ...form, ageMax: parseInt(e.target.value) })
                  }
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Distance */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-zinc-400">Max Distance</span>
              <span className="text-rose-400 text-sm font-semibold">
                {form.distance} km
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={form.distance}
              onChange={(e) =>
                setForm({ ...form, distance: parseInt(e.target.value) })
              }
              className="w-full accent-rose-500"
            />
          </div>

          {/* Show me */}
          <div>
            <p className="text-sm text-zinc-400 mb-2">Show Me</p>
            <div className="grid grid-cols-3 gap-2">
              {["men", "women", "everyone"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setForm({ ...form, showMe: opt })}
                  className={`py-2.5 rounded-xl text-sm font-semibold border capitalize transition-all ${
                    form.showMe === opt
                      ? "bg-rose-500/15 border-rose-500 text-rose-400"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full mt-6"
          isLoading={isSaving}
          onClick={handleSave}
        >
          <CheckCircle2 size={18} />
          Save Settings
        </Button>
      </div>
    </Modal>
  );
};

// ── Main Profile Page ──────────────────────────────────────
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    extraInfo: user?.extraInfo || "",
    height: user?.height || "",
    religion: user?.religion || "",
    education: user?.education || "",
    jobTitle: user?.jobTitle || "",
    drinking: user?.drinking || "",
    smoking: user?.smoking || "",
    interests: user?.interests || [],
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        extraInfo: user.extraInfo || "",
        height: user.height || "",
        religion: user.religion || "",
        education: user.education || "",
        jobTitle: user.jobTitle || "",
        drinking: user.drinking || "",
        smoking: user.smoking || "",
        interests: user.interests || [],
      });
    }
  }, [user]);

  // ── Save profile ──────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSaving(true);
    try {
      const res = await userAPI.updateProfile({
        ...form,
        height: form.height ? parseInt(form.height) : undefined,
      });
      updateUser(res.data.data.user);
      setIsEditing(false);
      toast.success("Profile updated ✓");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || "",
      bio: user?.bio || "",
      extraInfo: user?.extraInfo || "",
      height: user?.height || "",
      religion: user?.religion || "",
      education: user?.education || "",
      jobTitle: user?.jobTitle || "",
      drinking: user?.drinking || "",
      smoking: user?.smoking || "",
      interests: user?.interests || [],
    });
    setIsEditing(false);
  };

  // ── Photo handlers ────────────────────────────────────────
  const handleAddPhotos = async (formData) => {
    try {
      const res = await userAPI.uploadPhotos(formData);
      updateUser({ photos: res.data.data.photos });
      toast.success("Photos uploaded ✓");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  const handleDeletePhoto = async (publicId) => {
    try {
      await userAPI.deletePhoto(publicId);
      const updated = user.photos.filter((p) => p.publicId !== publicId);
      updateUser({ photos: updated });
      toast.success("Photo removed");
    } catch (err) {
      toast.error("Failed to delete photo");
    }
  };

  // ── Discovery settings ────────────────────────────────────
  const handleSaveDiscovery = async (settings) => {
    try {
      await userAPI.updateDiscoverySettings(settings);
      updateUser({ discoverySettings: settings });
      toast.success("Discovery settings saved ✓");
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  // ── Interest toggle ───────────────────────────────────────
  const toggleInterest = (interest) => {
    const clean = interest.split(" ").slice(1).join(" ");
    setForm((prev) => {
      const has = prev.interests.includes(clean);
      if (has)
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== clean),
        };
      if (prev.interests.length >= 7) {
        toast.error("Max 7 interests");
        return prev;
      }
      return { ...prev, interests: [...prev.interests, clean] };
    });
  };

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const photos = user?.photos || [];
  const discoverySettings = user?.discoverySettings || {
    ageMin: 18,
    ageMax: 45,
    distance: 50,
    showMe: "everyone",
  };

  return (
    <div className="min-h-screen bg-black pb-28 md:pb-8 md:pt-16">
      {/* ── Background ───────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 pt-4">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <User size={22} className="text-rose-400" />
            <h1 className="text-white font-black text-xl">Profile</h1>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-zinc-400 hover:text-white text-sm transition-colors"
              >
                <X size={15} />
                Cancel
              </button>
              <Button size="sm" isLoading={isSaving} onClick={handleSave}>
                <Save size={14} />
                Save
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-zinc-900 border border-zinc-800 text-zinc-300
                hover:border-zinc-600 hover:text-white text-sm transition-all"
            >
              <Edit3 size={14} />
              Edit
            </button>
          )}
        </div>

        {/* ── Profile header card ─────────────────────────────── */}
        <div className="relative mb-5 rounded-2xl overflow-hidden border border-zinc-800">
          {/* Cover / main photo */}
          <div className="h-48 relative">
            {photos[0]?.url ? (
              <img
                src={photos[0].url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                <User size={48} className="text-zinc-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-white font-black text-2xl">
              {user?.name}, {user?.age}
            </h2>
            {user?.location?.city && (
              <div className="flex items-center gap-1.5 text-zinc-300 text-sm mt-1">
                <MapPin size={13} className="text-rose-400" />
                <span>
                  {user.location.city}, {user.location.country}
                </span>
              </div>
            )}
          </div>

          {/* Profile complete badge */}
          <div className="absolute top-3 right-3">
            {user?.profileComplete ? (
              <span
                className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/40
                text-green-400 text-xs px-2.5 py-1 rounded-full font-semibold"
              >
                <CheckCircle2 size={11} />
                Complete
              </span>
            ) : (
              <span
                className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40
                text-amber-400 text-xs px-2.5 py-1 rounded-full font-semibold"
              >
                <Info size={11} />
                Incomplete
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* ── Photos ─────────────────────────────────────────── */}
          <Section
            title="Photos"
            icon={Camera}
            action={
              !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Manage
                </button>
              )
            }
          >
            <PhotoGrid
              photos={photos}
              onAdd={handleAddPhotos}
              onDelete={handleDeletePhoto}
              isEditing={isEditing}
            />
          </Section>

          {/* ── Basic Info ──────────────────────────────────────── */}
          <Section title="About Me" icon={User}>
            {isEditing ? (
              <div className="flex flex-col gap-4">
                <Input
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-400">
                    Bio
                  </label>
                  <div className="relative">
                    <textarea
                      value={form.bio}
                      onChange={(e) =>
                        setForm({ ...form, bio: e.target.value })
                      }
                      rows={4}
                      maxLength={500}
                      placeholder="Tell people about yourself..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl
                        px-4 py-3 text-white text-sm placeholder-zinc-600
                        outline-none focus:border-rose-500/50 resize-none
                        transition-all leading-relaxed"
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-zinc-600">
                      {form.bio.length}/500
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-400">
                    Extra things to know
                  </label>
                  <textarea
                    value={form.extraInfo}
                    onChange={(e) =>
                      setForm({ ...form, extraInfo: e.target.value })
                    }
                    rows={2}
                    maxLength={300}
                    placeholder="Quirks, deal-breakers, fun facts..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl
                      px-4 py-3 text-white text-sm placeholder-zinc-600
                      outline-none focus:border-rose-500/50 resize-none
                      transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {user?.bio ? (
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-zinc-600 text-sm italic">No bio yet</p>
                )}
                {user?.extraInfo && (
                  <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                    <Info
                      size={13}
                      className="text-amber-400 mt-0.5 shrink-0"
                    />
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      {user.extraInfo}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* ── Interests ───────────────────────────────────────── */}
          <Section title="Interests" icon={Heart}>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {INTERESTS_ALL.map((interest) => {
                  const clean = interest.split(" ").slice(1).join(" ");
                  const selected = form.interests.includes(clean);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? "bg-rose-500/15 border-rose-500 text-rose-400"
                          : "bg-zinc-800/50 border-zinc-800 text-zinc-500 hover:border-zinc-600"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user?.interests?.length > 0 ? (
                  user.interests.map((i) => (
                    <span
                      key={i}
                      className="bg-rose-500/10 border border-rose-500/20
                        text-rose-300 text-xs px-3 py-1.5 rounded-full"
                    >
                      {i}
                    </span>
                  ))
                ) : (
                  <p className="text-zinc-600 text-sm italic">
                    No interests added yet
                  </p>
                )}
              </div>
            )}
          </Section>

          {/* ── Lifestyle ───────────────────────────────────────── */}
          <Section title="Lifestyle" icon={Flame}>
            {isEditing ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-500">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={250}
                      placeholder="175"
                      value={form.height}
                      onChange={(e) =>
                        setForm({ ...form, height: e.target.value })
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl
                        px-4 py-2.5 text-white text-sm placeholder-zinc-600
                        outline-none focus:border-rose-500/50 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-500">
                      Religion
                    </label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={form.religion}
                      onChange={(e) =>
                        setForm({ ...form, religion: e.target.value })
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl
                        px-4 py-2.5 text-white text-sm placeholder-zinc-600
                        outline-none focus:border-rose-500/50 transition-all"
                    />
                  </div>
                </div>

                <Input
                  label="Education"
                  placeholder="e.g. B.Tech, MBA"
                  value={form.education}
                  onChange={(e) =>
                    setForm({ ...form, education: e.target.value })
                  }
                />

                <Input
                  label="Job Title"
                  icon={Briefcase}
                  placeholder="e.g. Software Engineer"
                  value={form.jobTitle}
                  onChange={(e) =>
                    setForm({ ...form, jobTitle: e.target.value })
                  }
                />

                {/* Drinking */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500">
                    Drinking
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DRINKING_OPTS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => setForm({ ...form, drinking: o.value })}
                        className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                          form.drinking === o.value
                            ? "bg-rose-500/10 border-rose-500/50 text-rose-400"
                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smoking */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500">
                    Smoking
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SMOKING_OPTS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => setForm({ ...form, smoking: o.value })}
                        className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                          form.smoking === o.value
                            ? "bg-rose-500/10 border-rose-500/50 text-rose-400"
                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: Ruler,
                    label: "Height",
                    value: user?.height ? `${user.height} cm` : null,
                  },
                  { icon: Briefcase, label: "Job", value: user?.jobTitle },
                  {
                    icon: GraduationCap,
                    label: "Education",
                    value: user?.education,
                  },
                  { icon: Heart, label: "Religion", value: user?.religion },
                  { icon: Wine, label: "Drinking", value: user?.drinking },
                  { icon: Cigarette, label: "Smoking", value: user?.smoking },
                ].map(({ icon: Icon, label, value }) =>
                  value ? (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 bg-zinc-900/60
                        border border-zinc-800 rounded-xl px-3 py-2.5"
                    >
                      <Icon size={14} className="text-rose-400 shrink-0" />
                      <div>
                        <p className="text-zinc-600 text-xs">{label}</p>
                        <p className="text-zinc-200 text-sm font-medium capitalize">
                          {value}
                        </p>
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </Section>

          {/* ── Settings ────────────────────────────────────────── */}
          <Section title="Settings" icon={Settings}>
            <div className="flex flex-col divide-y divide-zinc-800/60">
              {/* Discovery settings */}
              <button
                onClick={() => setShowDiscovery(true)}
                className="flex items-center justify-between py-3.5 hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20
                    flex items-center justify-center"
                  >
                    <SlidersHorizontal size={14} className="text-rose-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">
                      Discovery Settings
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {discoverySettings.ageMin}–{discoverySettings.ageMax} yrs
                      · {discoverySettings.distance} km ·{" "}
                      {discoverySettings.showMe}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-600" />
              </button>

              {/* Account info */}
              <div className="py-3.5 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700
                  flex items-center justify-center"
                >
                  <Shield size={14} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Account</p>
                  <p className="text-zinc-500 text-xs">
                    {user?.email || user?.phone} ·{" "}
                    <span
                      className={
                        user?.isVerified ? "text-green-400" : "text-amber-400"
                      }
                    >
                      {user?.isVerified ? "✓ Verified" : "Unverified"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-3 py-3.5 hover:opacity-80 transition-opacity"
              >
                <div
                  className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20
                  flex items-center justify-center"
                >
                  <LogOut size={14} className="text-red-400" />
                </div>
                <p className="text-red-400 text-sm font-medium">Log Out</p>
              </button>
            </div>
          </Section>
        </div>
      </div>

      {/* ── Discovery Modal ──────────────────────────────────── */}
      <DiscoveryModal
        isOpen={showDiscovery}
        onClose={() => setShowDiscovery(false)}
        settings={discoverySettings}
        onSave={handleSaveDiscovery}
      />

      {/* ── Logout Confirm Modal ─────────────────────────────── */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
      >
        <div className="p-6">
          <div
            className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20
            flex items-center justify-center mx-auto mb-4"
          >
            <LogOut size={20} className="text-red-400" />
          </div>
          <h3 className="text-white font-bold text-lg text-center mb-2">
            Log Out?
          </h3>
          <p className="text-zinc-500 text-sm text-center mb-6">
            You'll need to sign in again to access your account.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="lg"
              className="flex-1"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
