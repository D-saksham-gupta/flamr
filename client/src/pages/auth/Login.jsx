import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, Lock, Flame, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [method, setMethod] = useState("email"); // email | phone
  const [form, setForm] = useState({ email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (method === "email" && !form.email) e.email = "Email is required";
    if (method === "phone" && !form.phone) e.phone = "Phone is required";
    if (!form.password) e.password = "Password is required";
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

    const result = await login(payload);

    if (result.success) {
      toast.success("Welcome back 🔥");
      navigate(result.needsOnboarding ? "/onboarding" : "/");
    } else if (result.data?.needsVerification) {
      toast.error("Please verify your account");
      navigate("/verify-otp", {
        state: { userId: result.data.userId },
      });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* ── Left panel (desktop) ──────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-rose-900/40 via-black to-orange-900/20" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #ff4458 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, #ff7043 0%, transparent 50%)`,
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
              Where sparks
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-400 to-orange-400">
                become flames
              </span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Real connections with real people.
              <br />
              Find your person today.
            </p>
          </div>
          <div className="flex gap-8 text-zinc-500 text-sm">
            <div>
              <p className="text-white text-2xl font-bold">2M+</p>
              <p>Active users</p>
            </div>
            <div>
              <p className="text-white text-2xl font-bold">180K+</p>
              <p>Matches made</p>
            </div>
            <div>
              <p className="text-white text-2xl font-bold">4.9★</p>
              <p>App rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Flame className="text-rose-500" size={28} />
            <span className="text-white font-black text-2xl">flamr</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-zinc-500">Sign in to continue your journey</p>
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

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-rose-400 hover:text-rose-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Sign In <ArrowRight size={18} />
            </Button>
          </form>

          <p className="text-center text-zinc-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-rose-400 hover:text-rose-300 font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
