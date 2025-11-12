/**
 * Main App component with routing.
 * Handles navigation between Landing, Auth, and Tournament pages.
 */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TournamentDashboard from "./pages/TournamentDashboard";
import ProfilePage from "./pages/ProfilePage";
import FeedPage from "./pages/FeedPage";
import TeamFinderPage from "./pages/TeamFinderPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/landing/Footer";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-black to-black flex flex-col">
        <Navbar />
        <main className="flex-1" role="main">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/tournaments" /> : <LoginPage />
              }
            />
            <Route
              path="/signup"
              element={
                isAuthenticated ? (
                  <Navigate to="/tournaments" />
                ) : (
                  <SignupPage />
                )
              }
            />

            {/* Protected routes */}
            <Route
              path="/tournaments"
              element={
                <ProtectedRoute>
                  <TournamentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <FeedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-finder"
              element={
                <ProtectedRoute>
                  <TeamFinderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
