import React from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { NavLink, useNavigate } from "react-router-dom";
import { User, LogOut, Menu, PawPrint } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

// --------------------------------------------------
// Types
// --------------------------------------------------

interface UserType {
  role?: string;
  name?: string;
  [key: string]: any;
}

interface NavLinksProps {
  user: UserType | null;
  handleLogout: () => void;
}

// --------------------------------------------------
// NavLinks Component
// --------------------------------------------------

const NavLinks: React.FC<NavLinksProps> = ({ user, handleLogout }) => {
  return (
    <>
      {/* ===========================
          NEW PUBLIC LINKS
      ============================ */}
      <Button asChild variant="ghost">
        <NavLink to="/adoptables">Adoptable Pets</NavLink>
      </Button>

      <Button asChild variant="ghost">
        <NavLink to="/mypets">My Pets</NavLink>
      </Button>

      {/* ===========================
          EXISTING LOGIC
      ============================ */}
      {user ? (
        <>
          {/* Browse Pets */}
          <Button asChild variant="ghost">
            <NavLink to="/home">Browse Pets</NavLink>
          </Button>

          {/* Parent-only links */}
          {user.role === "parent" && (
            <>
              <Button asChild variant="ghost">
                <NavLink to="/adoptables">My Adoptables</NavLink>
              </Button>

              <Button asChild variant="ghost">
                <NavLink to="/requests">Interested Requests</NavLink>
              </Button>
            </>
          )}

          {/* Adopter-only link */}
          {user.role === "adopter" && (
            <Button asChild variant="ghost">
              <NavLink to="/mypets">My Pets</NavLink>
            </Button>
          )}

          {/* Profile */}
          <Button asChild variant="ghost">
            <NavLink to="/profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </NavLink>
          </Button>

          {/* Logout */}
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button asChild variant="ghost">
            <NavLink to="/login">Login</NavLink>
          </Button>

          <Button asChild>
            <NavLink to="/register">Sign Up</NavLink>
          </Button>
        </>
      )}
    </>
  );
};

// --------------------------------------------------
// Header Component
// --------------------------------------------------

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate(user ? "/home" : "/")}
        >
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
            <PawPrint className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl">PetConnect</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLinks user={user} handleLogout={handleLogout} />
        </nav>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          <SheetContent>
            <div className="flex flex-col gap-4 mt-8">
              <NavLinks user={user} handleLogout={handleLogout} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
