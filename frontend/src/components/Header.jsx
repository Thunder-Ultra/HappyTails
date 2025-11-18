import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Heart, User, LogOut, Menu, PawPrint } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export const Header = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  const NavLinks = () => (
    <>
      {user ? (
        <>
          <Button
            variant={currentPage === 'home' ? 'default' : 'ghost'}
            onClick={() => onNavigate('home')}
          >
            Browse Pets
          </Button>

          {user.role === 'parent' && (
            <>
              <Button
                variant={currentPage === 'adoptables' ? 'default' : 'ghost'}
                onClick={() => onNavigate('adoptables')}
              >
                My Adoptables
              </Button>
              <Button
                variant={currentPage === 'requests' ? 'default' : 'ghost'}
                onClick={() => onNavigate('requests')}
              >
                Interested Requests
              </Button>
            </>
          )}

          {user.role === 'adopter' && (
            <Button
              variant={currentPage === 'mypets' ? 'default' : 'ghost'}
              onClick={() => onNavigate('mypets')}
            >
              My Pets
            </Button>
          )}

          <Button
            variant={currentPage === 'profile' ? 'default' : 'ghost'}
            onClick={() => onNavigate('profile')}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>

          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={() => onNavigate('login')}>
            Login
          </Button>
          <Button onClick={() => onNavigate('register')}>
            Sign Up
          </Button>
        </>
      )}
    </>
  );

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate(user ? 'home' : 'landing')}
        >
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
            <PawPrint className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl">PetConnect</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLinks />
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right">
            <div className="flex flex-col gap-4 mt-8">
              <NavLinks />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
