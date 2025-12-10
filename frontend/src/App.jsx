import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import { Header } from "./components/Header";
import { LandingPage } from "./pages/LandingPage";
import GoogleSuccess from "./pages/GoggleSuccess";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { HomePage } from "./pages/HomePage";

import PetDetailsPage from "./pages/PetDetailsPage";
import { AdoptablesPage } from "./pages/AdoptablesPage";
import InterestedRequestsPage from "./pages/InterestedRequestsPage";
import MyPetsPage from "./pages/MyPetsPage";
import PetProfilePage from "./pages/PetProfilePage";
import ProfilePage from "./pages/ProfilePage";

import { Toaster } from "./components/ui/sonner";
import { initializeMockData } from "./utils/mockData";

const AppContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const authRoutes = ["/", "/login", "/register"];
      if (authRoutes.includes(window.location.pathname)) {
        navigate("/home");
      }
    }
  }, [user, navigate]);

  const hideHeaderRoutes = ["/", "/login", "/register", "/forgotpassword"];
  const shouldHideHeader = hideHeaderRoutes.includes(window.location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!shouldHideHeader && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/google-success" element={<GoogleSuccess />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgotpassword" element={<ForgotPasswordPage />} />

          <Route path="/home" element={<HomePage />} />
          <Route path="/adoptables" element={<AdoptablesPage />} />
          <Route path="/requests" element={<InterestedRequestsPage />} />
          <Route path="/mypets" element={<MyPetsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/pet/:id" element={<PetDetailsPage />} />
          <Route path="/petprofile/:id" element={<PetProfilePage />} />

          <Route path="/auth/google/success" element={<GoogleSuccess />} />
        </Routes>
      </main>

      <Toaster position="top-right" />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}