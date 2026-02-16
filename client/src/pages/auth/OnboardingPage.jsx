import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  ArrowRight,
  ArrowLeft,
  Camera,
  X,
  MapPin,
  User,
  Heart,
  Sparkles,
  Upload,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore.js";
import { userAPI } from "../../api/user.api.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

// ── Constants ─────────────────────────────────────────────
const TOTAL_STEPS = 5;

const GENDERS = [
  { value: "man", label: "Man", emoji: "👨" },
  { value: "woman", label: "Woman", emoji: "👩" },
  { value: "non-binary", label: "Non-binary", emoji: "🧑" },
  { value: "other", label: "Other", emoji: "✨" },
];

const PREFERENCES = [
  { value: "men", label: "Men", emoji: "👨" },
  { value: "women", label: "Women", emoji: "👩" },
  { value: "everyone", label: "Everyone", emoji: "💫" },
];

const INTERESTS = [
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
  { value: "never", label: "Never", emoji: "🚫" },
  { value: "sometimes", label: "Sometimes", emoji: "🥂" },
  { value: "often", label: "Often", emoji: "🍺" },
];

const SMOKING_OPTS = [
  { value: "never", label: "Never", emoji: "🚭" },
  { value: "sometimes", label: "Sometimes", emoji: "🌬️" },
  { value: "often", label: "Often", emoji: "🚬" },
];

// ── Sub-components ────────────────────────────────────────

const ProgressBar = ({ step, total }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1 flex-1 rounded-full transition-all duration-500 ${
          i < step ? "bg-rose-500" : "bg-zinc-800"
        }`}
      />
    ))}
  </div>
);

const OptionButton = ({ selected, onClick, children, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex items-center gap-3 px-4 py-3 rounded-xl border
      font-medium text-sm transition-all duration-200 text-left
      ${
        selected
          ? "bg-rose-500/15 border-rose-500 text-rose-400"
          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
      }
      ${className}
    `}
  >
    {children}
  </button>
);

// ── Step Components ───────────────────────────────────────

// Step 1: Basic Info
const StepBasicInfo = ({ data, onChange }) => (
  <div className="flex flex-col gap-5">
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">
        Let's start with the basics
      </h2>
      <p className="text-zinc-500 text-sm">Tell us a little about yourself</p>
    </div>

    <Input
      label="Your Name"
      placeholder="What do people call you?"
      value={data.name}
      onChange={(e) => onChange("name", e.target.value)}
      icon={User}
    />

    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-400">Your Age</label>
      <input
        type="number"
        min={18}
        max={99}
        placeholder="Must be 18+"
        value={data.age}
        onChange={(e) => onChange("age", e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3
          text-white placeholder-zinc-600 outline-none
          focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/10
          transition-all duration-200"
      />
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-400">I am a...</label>
      <div className="grid grid-cols-2 gap-2">
        {GENDERS.map((g) => (
          <OptionButton
            key={g.value}
            selected={data.gender === g.value}
            onClick={() => onChange("gender", g.value)}
          >
            <span className="text-lg">{g.emoji}</span>
            <span>{g.label}</span>
          </OptionButton>
        ))}
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-400">
        Interested in...
      </label>
      <div className="grid grid-cols-3 gap-2">
        {PREFERENCES.map((p) => (
          <OptionButton
            key={p.value}
            selected={data.sexualPreference === p.value}
            onClick={() => onChange("sexualPreference", p.value)}
            className="justify-center text-center flex-col gap-1"
          >
            <span className="text-xl">{p.emoji}</span>
            <span>{p.label}</span>
          </OptionButton>
        ))}
      </div>
    </div>
  </div>
);

// Step 2: Bio
const StepBio = ({ data, onChange }) => (
  <div className="flex flex-col gap-5">
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Tell your story</h2>
      <p className="text-zinc-500 text-sm">Let people know who you are</p>
    </div>

    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-400">
        Bio <span className="text-zinc-600">(required)</span>
      </label>
      <div className="relative">
        <textarea
          placeholder="Write something interesting about yourself... What are you passionate about? What makes you laugh? What are you looking for?"
          value={data.bio}
          onChange={(e) => onChange("bio", e.target.value)}
          maxLength={500}
          rows={5}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3
            text-white placeholder-zinc-600 outline-none resize-none
            focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/10
            transition-all duration-200 text-sm leading-relaxed"
        />
        <span className="absolute bottom-3 right-3 text-xs text-zinc-600">
          {data.bio.length}/500
        </span>
      </div>
    </div>

    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-400">
        Extra things to know about me{" "}
        <span className="text-zinc-600">(optional)</span>
      </label>
      <div className="relative">
        <textarea
          placeholder="Allergies, deal-breakers, fun facts, quirks..."
          value={data.extraInfo}
          onChange={(e) => onChange("extraInfo", e.target.value)}
          maxLength={300}
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3
            text-white placeholder-zinc-600 outline-none resize-none
            focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/10
            transition-all duration-200 text-sm leading-relaxed"
        />
        <span className="absolute bottom-3 right-3 text-xs text-zinc-600">
          {data.extraInfo.length}/300
        </span>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-400">
        Your Interests <span className="text-zinc-600">(pick up to 7)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((interest) => {
          const clean = interest.split(" ").slice(1).join(" ");
          const selected = data.interests.includes(clean);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => {
                if (selected) {
                  onChange(
                    "interests",
                    data.interests.filter((i) => i !== clean),
                  );
                } else if (data.interests.length < 7) {
                  onChange("interests", [...data.interests, clean]);
                } else {
                  toast.error("Max 7 interests");
                }
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selected
                  ? "bg-rose-500/15 border-rose-500 text-rose-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {interest}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

// Step 3: Lifestyle
const StepLifestyle = ({ data, onChange }) => (
  <div className="flex flex-col gap-5">
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Your lifestyle</h2>
      <p className="text-zinc-500 text-sm">
        Help matches understand you better
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-400">Height (cm)</label>
        <input
          type="number"
          min={100}
          max={250}
          placeholder="e.g. 175"
          value={data.height}
          onChange={(e) => onChange("height", e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3
            text-white placeholder-zinc-600 outline-none
            focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/10
            transition-all duration-200"
        />
      </div>

      <Input
        label="Religion"
        placeholder="e.g. Hindu, Agnostic"
        value={data.religion}
        onChange={(e) => onChange("religion", e.target.value)}
      />
    </div>

    <Input
      label="Education"
      placeholder="e.g. B.Tech, MBA"
      value={data.education}
      onChange={(e) => onChange("education", e.target.value)}
    />

    <Input
      label="Job Title"
      placeholder="e.g. Software Engineer"
      value={data.jobTitle}
      onChange={(e) => onChange("jobTitle", e.target.value)}
    />

    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-400">Drinking</label>
      <div className="grid grid-cols-3 gap-2">
        {DRINKING_OPTS.map((o) => (
          <OptionButton
            key={o.value}
            selected={data.drinking === o.value}
            onClick={() => onChange("drinking", o.value)}
            className="justify-center flex-col text-center gap-1"
          >
            <span className="text-xl">{o.emoji}</span>
            <span>{o.label}</span>
          </OptionButton>
        ))}
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-400">Smoking</label>
      <div className="grid grid-cols-3 gap-2">
        {SMOKING_OPTS.map((o) => (
          <OptionButton
            key={o.value}
            selected={data.smoking === o.value}
            onClick={() => onChange("smoking", o.value)}
            className="justify-center flex-col text-center gap-1"
          >
            <span className="text-xl">{o.emoji}</span>
            <span>{o.label}</span>
          </OptionButton>
        ))}
      </div>
    </div>
  </div>
);

// Step 4: Photos
const StepPhotos = ({ photos, onAdd, onRemove }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => onAdd({ file, preview: ev.target.result });
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Add your photos</h2>
        <p className="text-zinc-500 text-sm">
          Add 3–5 photos. Your first photo is your main profile picture.
        </p>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 5 }).map((_, i) => {
          const photo = photos[i];
          return (
            <div
              key={i}
              className={`relative aspect-3/4 rounded-xl overflow-hidden border-2
                ${
                  photo
                    ? "border-rose-500/50"
                    : "border-dashed border-zinc-700 bg-zinc-900"
                }
              `}
            >
              {photo ? (
                <>
                  <img
                    src={photo.preview}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-md font-semibold">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white hover:bg-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors gap-1"
                >
                  <Camera size={20} />
                  <span className="text-xs">Add</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl
          border-2 border-dashed border-zinc-700 text-zinc-400
          hover:border-rose-500/50 hover:text-rose-400
          transition-all duration-200"
      >
        <Upload size={18} />
        <span className="text-sm font-medium">Upload photos</span>
      </button>

      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
        <p className="text-xs text-zinc-500 leading-relaxed">
          💡 <strong className="text-zinc-300">Tips:</strong> Use clear face
          photos, show your personality, include one full-body shot. Avoid
          sunglasses in your main photo.
        </p>
      </div>
    </div>
  );
};

// Step 5: Location
const StepLocation = ({ data, onChange, onDetect, detecting }) => (
  <div className="flex flex-col gap-5">
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Where are you?</h2>
      <p className="text-zinc-500 text-sm">
        Used to find matches near you. We never share your exact location.
      </p>
    </div>

    {/* Auto detect */}
    <button
      type="button"
      onClick={onDetect}
      disabled={detecting}
      className={`
        flex items-center gap-3 w-full p-4 rounded-xl border-2
        transition-all duration-200
        ${
          data.city
            ? "bg-rose-500/10 border-rose-500/50 text-rose-400"
            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-rose-500/30 hover:text-zinc-200"
        }
        disabled:opacity-70 disabled:cursor-not-allowed
      `}
    >
      <MapPin size={20} className={detecting ? "animate-bounce" : ""} />
      <div className="text-left flex-1">
        <p className="font-semibold text-sm">
          {detecting
            ? "Detecting location..."
            : data.city
              ? `📍 ${data.city}${data.country ? `, ${data.country}` : ""}`
              : "Detect my location automatically"}
        </p>
        <p className="text-xs opacity-60 mt-0.5">
          {data.latitude
            ? `${parseFloat(data.latitude).toFixed(4)}, ${parseFloat(data.longitude).toFixed(4)}`
            : "Tap to use GPS"}
        </p>
      </div>
      {data.city && (
        <CheckCircle2 size={18} className="text-rose-400 shrink-0" />
      )}
    </button>

    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-zinc-800" />
      <span className="text-zinc-600 text-xs">or enter manually</span>
      <div className="h-px flex-1 bg-zinc-800" />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <Input
        label="City"
        placeholder="e.g. Mumbai"
        value={data.city}
        onChange={(e) => onChange("city", e.target.value)}
      />
      <Input
        label="Country"
        placeholder="e.g. India"
        value={data.country}
        onChange={(e) => onChange("country", e.target.value)}
      />
    </div>

    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
      <p className="text-xs text-amber-400/80 leading-relaxed">
        🔒 Your precise location is only used to calculate distances. Other
        users only see approximate distance (e.g. "5 km away").
      </p>
    </div>
  </div>
);

// ── Main Onboarding Component ─────────────────────────────
const OnboardingPage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    sexualPreference: "",
    bio: "",
    extraInfo: "",
    interests: [],
    height: "",
    religion: "",
    education: "",
    jobTitle: "",
    drinking: "",
    smoking: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
  });

  const [photos, setPhotos] = useState([]); // [{ file, preview }]

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ── Validate each step before advancing ──────────────────
  const validateStep = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return false;
      }
      if (!formData.age || parseInt(formData.age) < 18) {
        toast.error("You must be at least 18");
        return false;
      }
      if (!formData.gender) {
        toast.error("Please select your gender");
        return false;
      }
      if (!formData.sexualPreference) {
        toast.error("Please select your preference");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.bio.trim()) {
        toast.error("Bio is required");
        return false;
      }
      if (formData.bio.trim().length < 20) {
        toast.error("Bio must be at least 20 characters");
        return false;
      }
    }
    if (step === 4) {
      if (photos.length < 1) {
        toast.error("Please add at least 1 photo");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Location detection ────────────────────────────────────
  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode using free API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const geo = await res.json();
          const city =
            geo.address?.city ||
            geo.address?.town ||
            geo.address?.village ||
            geo.address?.county ||
            "";
          const country = geo.address?.country || "";
          handleChange("latitude", latitude.toString());
          handleChange("longitude", longitude.toString());
          handleChange("city", city);
          handleChange("country", country);
          toast.success(`Location set: ${city}`);
        } catch {
          handleChange("latitude", latitude.toString());
          handleChange("longitude", longitude.toString());
          toast.success("Location detected (city lookup failed)");
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        toast.error("Location access denied. Please enter manually.");
        console.error(err.message);
      },
      { timeout: 10000 },
    );
  };

  // ── Photo handlers ────────────────────────────────────────
  const addPhoto = (photo) => {
    setPhotos((prev) => [...prev, photo]);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Final submit ──────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.city && !formData.latitude) {
      toast.error("Please add your location");
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Save profile data
      const profilePayload = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        sexualPreference: formData.sexualPreference,
        bio: formData.bio.trim(),
        extraInfo: formData.extraInfo.trim(),
        interests: formData.interests,
        ...(formData.height && { height: parseInt(formData.height) }),
        ...(formData.religion && { religion: formData.religion }),
        ...(formData.education && { education: formData.education }),
        ...(formData.jobTitle && { jobTitle: formData.jobTitle }),
        ...(formData.drinking && { drinking: formData.drinking }),
        ...(formData.smoking && { smoking: formData.smoking }),
        location: {
          latitude: parseFloat(formData.latitude) || 0,
          longitude: parseFloat(formData.longitude) || 0,
          city: formData.city,
          country: formData.country,
        },
      };

      const profileRes = await userAPI.completeOnboarding(profilePayload);

      // Step 2: Upload photos
      if (photos.length > 0) {
        const fd = new FormData();
        photos.forEach((p) => fd.append("photos", p.file));
        await userAPI.uploadPhotos(fd);
      }

      // Step 3: Update location separately
      if (formData.latitude && formData.longitude) {
        await userAPI.updateLocation({
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          city: formData.city,
          country: formData.country,
        });
      }

      // Update store
      updateUser({
        ...profileRes.data.data.user,
        profileComplete: true,
      });

      toast.success("Profile created! Let's find your match 🔥");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = step === TOTAL_STEPS;

  const stepTitles = [
    "Basic Info",
    "Your Story",
    "Lifestyle",
    "Photos",
    "Location",
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 py-8 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Flame className="text-rose-500" size={24} />
            <span className="text-white font-black text-xl">flamr</span>
          </div>
          <div className="flex items-center gap-2">
            {stepTitles.map((title, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded-lg transition-all ${
                  i + 1 === step
                    ? "bg-rose-500/20 text-rose-400 font-semibold"
                    : i + 1 < step
                      ? "text-green-500"
                      : "text-zinc-700"
                }`}
              >
                {i + 1 < step ? "✓" : i + 1 === step ? title : "·"}
              </span>
            ))}
          </div>
        </div>

        {/* Progress */}
        <ProgressBar step={step} total={TOTAL_STEPS} />

        {/* Step content */}
        <div className="min-h-[60vh]">
          {step === 1 && (
            <StepBasicInfo data={formData} onChange={handleChange} />
          )}
          {step === 2 && <StepBio data={formData} onChange={handleChange} />}
          {step === 3 && (
            <StepLifestyle data={formData} onChange={handleChange} />
          )}
          {step === 4 && (
            <StepPhotos
              photos={photos}
              onAdd={addPhoto}
              onRemove={removePhoto}
            />
          )}
          {step === 5 && (
            <StepLocation
              data={formData}
              onChange={handleChange}
              onDetect={detectLocation}
              detecting={detectingLocation}
            />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur border-t border-zinc-800 p-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            {step > 1 && (
              <Button
                variant="secondary"
                size="lg"
                onClick={prevStep}
                className="shrink-0"
              >
                <ArrowLeft size={18} />
              </Button>
            )}

            <Button
              size="lg"
              className="flex-1"
              isLoading={isSubmitting}
              onClick={isLastStep ? handleSubmit : nextStep}
            >
              {isLastStep ? (
                <>
                  <Sparkles size={18} />
                  Complete Profile
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </div>

          {/* Step counter */}
          <p className="text-center text-zinc-600 text-xs mt-2">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
