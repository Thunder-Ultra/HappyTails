import React from "react";
import { Button } from "../components/ui/button";
import { Heart, Users, Shield, Sparkles } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Find Your Perfect Pet Companion
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Connect directly with pet parents and find loving homes for pets. A
            peer-to-peer platform built on trust and love.
          </p>

          <p className="text-xl text-gray-600 mb-8">
            HAPPY-TAILS , WHERE EVERY TAIL WAGS HAPPILY
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate("/register")}>
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&q=80"
            alt="Happy pets"
            className="w-full h-[400px] object-cover"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl text-center mb-12">Why Choose Happy-Tails?</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl mb-2">Direct Connection</h3>
            <p className="text-gray-600">
              Connect directly with pet parents without middlemen
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="text-xl mb-2">AI Matching</h3>
            <p className="text-gray-600">
              Find the perfect pet match based on your preferences
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl mb-2">Community Driven</h3>
            <p className="text-gray-600">
              Join a community of pet lovers and responsible parents
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl mb-2">Safe & Secure</h3>
            <p className="text-gray-600">Verified profiles and secure adoption process</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                1
              </div>
              <h3 className="text-xl mb-2">Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up as a pet parent or adopter with your details
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                2
              </div>
              <h3 className="text-xl mb-2">Browse or List Pets</h3>
              <p className="text-gray-600">
                Parents list pets, adopters browse and find matches
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                3
              </div>
              <h3 className="text-xl mb-2">Connect & Adopt</h3>
              <p className="text-gray-600">
                Send adoption requests and finalize the process
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of pet lovers finding their perfect companions
          </p>

          <Button size="lg" onClick={() => navigate("/register")}>
            Join Happy-Tails Today
          </Button>
        </div>
      </section>
    </div>
  );
};