import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flame, RefreshCw, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore.js";
import { authAPI } from "../../api/auth.api.js";
import Button from "../../components/ui/Button.jsx";

const OTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, isLoading } = useAuthStore();

  const userId = location.state?.userId;
  const method = location.state?.method || "email";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no userId
  useEffect(() => {
    if (!userId) navigate("/signup");
  }, [userId]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // max 1 digit
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    const result = await verifyOTP({ userId, otp: otpString });

    if (result.success) {
      toast.success("Account verified! 🎉");
      navigate(result.needsOnboarding ? "/onboarding" : "/");
    } else {
      toast.error(result.message);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authAPI.resendOTP({ userId });
      toast.success("New OTP sent!");
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (otp.every((d) => d !== "")) {
      handleSubmit();
    }
  }, [otp]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <Flame className="text-rose-500" size={32} />
          <span className="text-white font-black text-2xl">flamr</span>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-8">
          {/* Icon */}
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📬</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Verify your {method}
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              We sent a 6-digit code to your {method}.
              <br />
              Enter it below to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* OTP inputs */}
            <div className="flex gap-2.5 justify-center mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className={`
                    w-11 h-14 text-center text-xl font-bold
                    bg-zinc-800 border rounded-xl
                    text-white outline-none
                    transition-all duration-200
                    ${
                      digit
                        ? "border-rose-500 bg-rose-500/10 text-rose-400"
                        : "border-zinc-700 focus:border-rose-500/50"
                    }
                  `}
                />
              ))}
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Verify & Continue <ArrowRight size={18} />
            </Button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            {resendTimer > 0 ? (
              <p className="text-zinc-600 text-sm">
                Resend code in{" "}
                <span className="text-zinc-400 font-semibold tabular-nums">
                  {resendTimer}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-rose-400 hover:text-rose-300 text-sm font-semibold flex items-center gap-2 mx-auto transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={isResending ? "animate-spin" : ""}
                />
                Resend code
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Wrong account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-rose-400 cursor-pointer hover:text-rose-300"
          >
            Start over
          </span>
        </p>
      </div>
    </div>
  );
};

export default OTPPage;
