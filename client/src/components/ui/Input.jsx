import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({
  label,
  error,
  icon: Icon,
  type = "text",
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-400">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
            <Icon size={17} />
          </div>
        )}
        <input
          type={inputType}
          className={`
            w-full bg-zinc-900 border rounded-xl
            text-white placeholder-zinc-600
            transition-all duration-200 outline-none
            ${Icon ? "pl-10" : "pl-4"}
            ${isPassword ? "pr-11" : "pr-4"}
            py-3
            ${
              error
                ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                : "border-zinc-800 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/10"
            }
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
