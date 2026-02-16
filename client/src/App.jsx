import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore.js";
import { useSocket } from "./hooks/useSocket.js";

// Shared
import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";
import AppInitializer from "./components/shared/AppInitializer.jsx";
import ProtectedRoute from "./components/shared/ProtectedRoute.jsx";
import Navbar from "./components/shared/Navbar.jsx";

// Auth pages
import LoginPage from "./pages/auth/Login.jsx";
import SignupPage from "./pages/auth/Signup.jsx";
import OTPPage from "./pages/auth/OTPPage.jsx";
import OnboardingPage from "./pages/auth/OnboardingPage.jsx";

// App pages
import DiscoverPage from "./pages/app/DiscoverPage.jsx";
import MatchesPage from "./pages/app/MatchesPage.jsx";
import ChatPage from "./pages/app/ChatPage.jsx";
import ProfilePage from "./pages/app/ProfilePage.jsx";

// 404
import NotFound from "./pages/NotFound.jsx";

// ── Socket listener (runs when authenticated) ─────────────
const SocketListener = () => {
  useSocket();
  return null;
};

// ── Layout wrapper for app pages ──────────────────────────
const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="md:pt-16 pb-20 md:pb-6">{children}</main>
  </>
);

// ── Main App ──────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <AppInitializer>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppInitializer>
    </ErrorBoundary>
  );
}

const AppRoutes = () => {
  const { isAuthenticated, needsOnboarding } = useAuthStore();

  return (
    <>
      {/* Global toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid #27272a",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#f43f5e", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />

      {/* Socket listener — only when authenticated */}
      {isAuthenticated && <SocketListener />}

      <Routes>
        {/* ── Public routes ──────────────────────────── */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={needsOnboarding ? "/onboarding" : "/"} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to={needsOnboarding ? "/onboarding" : "/"} replace />
            ) : (
              <SignupPage />
            )
          }
        />
        <Route path="/verify-otp" element={<OTPPage />} />

        {/* ── Onboarding ─────────────────────────────── */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* ── Protected app routes ───────────────────── */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {needsOnboarding ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <AppLayout>
                  <DiscoverPage />
                </AppLayout>
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MatchesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:matchId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ── 404 ────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};
