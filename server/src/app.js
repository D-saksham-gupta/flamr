import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import swipeRoutes from "./routes/swipe.routes.js";
import matchRoutes from "./routes/match.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import reportRoutes from "./routes/report.routes.js";

// Middleware (imported AFTER routes)
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";

const app = express();
// Trust proxy (needed for rate limiting behind reverse proxy)
// ── Trust proxy (required for Render, Railway, Heroku etc.) ──
app.set("trust proxy", 1);

// ── Security & Parsing ────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ── Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Rate Limiting ─────────────────────────────────────────
app.use("/api", apiLimiter);

// ── Health Check ──────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "🔥 Flamr API is running" });
});

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/swipes", swipeRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reports", reportRoutes);

// ── Error Handling (MUST be last) ─────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
