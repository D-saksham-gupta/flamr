import { Component } from "react";
import { Flame, RefreshCw } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div
              className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20
              flex items-center justify-center mx-auto mb-6"
            >
              <Flame size={28} className="text-rose-400" />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">
              Something went wrong
            </h2>
            <p className="text-zinc-500 text-sm mb-2 leading-relaxed">
              An unexpected error occurred.
            </p>
            {import.meta.env.DEV && (
              <p
                className="text-red-400 text-xs mb-6 font-mono bg-zinc-900
                border border-zinc-800 rounded-xl p-3 text-left break-all"
              >
                {this.state.error?.message}
              </p>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl
                bg-rose-500/10 border border-rose-500/30 text-rose-400
                hover:bg-rose-500/20 transition-all text-sm font-semibold"
            >
              <RefreshCw size={16} />
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
