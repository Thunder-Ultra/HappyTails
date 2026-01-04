import React from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { NavLink, useNavigate } from "react-router-dom";
import { User, LogOut, Menu, ShieldCheck } from "lucide-react"; // Removed PawPrint as it's no longer used
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

// 1. Import your local logo file
// Adjust the path according to where your image is stored (e.g., ../assets/logo-rounded.png)
import logo from "../assets/logo-rounded.png";

const NavLinks = ({ user, handleLogout }) => {
  // console.log(user)
  return (
    <>
      <Button asChild variant="ghost">
        <NavLink to="/adoptables">My Adoptables</NavLink>
      </Button>

      <Button asChild variant="ghost">
        <NavLink to="/mypets">My Pets</NavLink>
      </Button>

      {user ? (
        <>
          <Button asChild variant="ghost">
            <NavLink to="/home">Browse Pets</NavLink>
          </Button>

          {user.role === "parent" && (
            <Button asChild variant="ghost">
              <NavLink to="/requests">Interested Requests</NavLink>
            </Button>
          )}

          <Button asChild variant="ghost">
            <NavLink to="/my-requests">
              My Requests
            </NavLink>
          </Button>

          {/* --- ADMIN ONLY LINK --- */}
          {(user.user.is_admin === "Yes" || user.user.isAdmin) && (
            <Button asChild variant="ghost" className="cursor-pointer text-blue-600 hover:text-blue-700 font-bold">
              <NavLink to="/admin">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Admin Panel
              </NavLink>
            </Button>
          )}



          <Button asChild variant="ghost">
            <NavLink to="/profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </NavLink>
          </Button>

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
export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      {/* 1. Increased padding from py-3 to py-5 (or py-6 for even taller) */}
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">

        {/* LOGO SECTION */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(user ? "/home" : "/")}
        >
          {/* 2. Increased logo height from h-10 to h-14 */}
          <img
            src={logo}
            alt="Happy Tails Logo"
            className="h-20 w-auto object-fit"
          />
          {/* 3. Increased text size to text-2xl to match the taller header */}
          <span className="text-2xl font-black tracking-tight text-gray-900">
            Happy Tails
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-3">
          <NavLinks user={user} handleLogout={handleLogout} />
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-8 w-8" />
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