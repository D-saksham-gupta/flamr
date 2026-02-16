import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, Lock, Flame, ArrowRight, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: "At least 6 characters", pass: password.length >= 6 },
    { label: "Contains a number", pass: /\d/.test(password) },
    { label: "Contains a letter", pass: /[a-zA-Z]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-zinc-700", "bg-red-500", "bg-yellow-500", "bg-green-500"];
  const labels = ["", "Weak", "Fair", "Strong"];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : "bg-zinc-800"
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`text-xs flex items-center gap-1 transition-colors ${
              c.pass ? "text-green-400" : "text-zinc-600"
            }`}
          >
            <Check size={10} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [method, setMethod] = useState("email");
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (method === "email") {
      if (!form.email) e.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    } else {
      if (!form.phone) e.phone = "Phone is required";
    }
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload =
      method === "email"
        ? { email: form.email, password: form.password }
        : { phone: form.phone, password: form.password };

    const result = await register(payload);

    if (result.success) {
      toast.success("OTP sent! Check your inbox 📬");
      navigate("/verify-otp", {
        state: { userId: result.data.userId, method },
      });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* ── Left panel ────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-orange-900/40 via-black to-rose-900/20" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 75% 25%, #ff7043 0%, transparent 50%),
                              radial-gradient(circle at 25% 75%, #ff4458 0%, transparent 50%)`,
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <Flame className="text-rose-500" size={36} />
            <span className="text-white font-black text-3xl tracking-tight">
              flamr
            </span>
          </div>
          <div>
            <h1 className="text-5xl font-black text-white leading-tight mb-6">
              Your story
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-rose-400">
                starts here
              </span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Join millions of people finding
              <br />
              meaningful connections every day.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { emoji: "🔒", text: "Safe & verified profiles" },
              { emoji: "⚡", text: "Instant matching" },
              { emoji: "💬", text: "Real-time chat" },
              { emoji: "🌍", text: "Location-based discovery" },
            ].map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10"
              >
                <span className="text-xl">{f.emoji}</span>
                <span className="text-zinc-300 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ───────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Flame className="text-rose-500" size={28} />
            <span className="text-white font-black text-2xl">flamr</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Create account
            </h2>
            <p className="text-zinc-500">
              Free forever. No credit card needed.
            </p>
          </div>

          {/* Method toggle */}
          <div className="flex bg-zinc-900 rounded-xl p-1 mb-6 border border-zinc-800">
            {["email", "phone"].map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all capitalize ${
                  method === m
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {method === "email" ? (
              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
              />
            ) : (
              <Input
                label="Phone Number"
                type="tel"
                icon={Phone}
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                error={errors.phone}
              />
            )}

            <div>
              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
              />
              <PasswordStrength password={form.password} />
            </div>

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              error={errors.confirmPassword}
            />

            <p className="text-xs text-zinc-600 leading-relaxed">
              By signing up you agree to our{" "}
              <span className="text-rose-400 cursor-pointer">Terms</span> and{" "}
              <span className="text-rose-400 cursor-pointer">
                Privacy Policy
              </span>
            </p>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Create Account <ArrowRight size={18} />
            </Button>
          </form>

          <p className="text-center text-zinc-500 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-rose-400 hover:text-rose-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
