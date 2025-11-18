import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";

import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import PetDetailsPage from "./pages/PetDetailsPage";
import AdoptablesPage from "./pages/AdoptablesPage";
import InterestedRequestsPage from "./pages/InterestedRequestsPage";
import MyPetsPage from "./pages/MyPetsPage";
import PetProfilePage from "./pages/PetProfilePage";
import ProfilePage from "./pages/ProfilePage";

import { Toaster } from "./components/ui/sonner";
import { initializeMockData } from "./utils/mockData";

const AppContent = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("landing");
  const [selectedPetId, setSelectedPetId] = useState(null);

  useEffect(() => {
    initializeMockData();

    if (
      user &&
      (currentPage === "landing" ||
        currentPage === "login" ||
        currentPage === "register")
    ) {
      setCurrentPage("home");
    }
  }, [user]);

  const handleNavigate = (page, petId) => {
    setCurrentPage(page);
    if (petId) setSelectedPetId(petId);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onNavigate={handleNavigate} />;
      case "register":
        return <RegisterPage onNavigate={handleNavigate} />;
      case "login":
        return <LoginPage onNavigate={handleNavigate} />;
      case "forgotpassword":
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "petdetails":
        return selectedPetId ? (
          <PetDetailsPage petId={selectedPetId} onNavigate={handleNavigate} />
        ) : (
          <HomePage onNavigate={handleNavigate} />
        );
      case "adoptables":
        return <AdoptablesPage onNavigate={handleNavigate} />;
      case "requests":
        return <InterestedRequestsPage onNavigate={handleNavigate} />;
      case "mypets":
        return <MyPetsPage onNavigate={handleNavigate} />;
      case "petprofile":
        return selectedPetId ? (
          <PetProfilePage petId={selectedPetId} onNavigate={handleNavigate} />
        ) : (
          <MyPetsPage onNavigate={handleNavigate} />
        );
      case "profile":
        return <ProfilePage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage !== "landing" &&
        currentPage !== "register" &&
        currentPage !== "login" &&
        currentPage !== "forgotpassword" && (
          <Header currentPage={currentPage} onNavigate={handleNavigate} />
        )}

      {renderPage()}
      <Toaster position="top-right" />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
