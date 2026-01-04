import React from "react";
import { Button } from "../components/ui/button";
import { Heart, Users, Shield, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* --- HERO SECTION --- */}
      <section className="relative pt-6 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-200 text-purple-600 text-sm font-medium shadow-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>The #1 Pet Adoption Community</span>
            </div>

            {/* Headline: Adjusted to text-5xl and md:text-6xl which exist in your CSS */}
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-gray-900 mb-6">
              Find Your Perfect <br />
              <span className="text-purple-600">
                Pet Companion
              </span>
            </h1>

            {/* Subhead: text-xl and text-gray-600 exist */}
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
              Connect directly with pet parents. No middlemen. Just a platform built on trust, transparency, and a love for animals.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button
                onClick={() => navigate("/register")}
                className="h-12 px-6 text-lg rounded-full bg-primary hover:bg-purple-50 text-white shadow-lg transition-transform"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="h-12 px-6 text-lg rounded-full bg-white border border-gray-100 text-gray-900 hover:bg-gray-50 transition-transform"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Hero Image: changed rounded-3xl to rounded-2xl (exists) and h-[400px] (exists) */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&q=80"
                alt="Happy pets"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-900">Why Happy-Tails?</h2>
            <p className="text-lg text-gray-600">Reimagining adoption to make it safer and happier for everyone.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
              <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Direct Connection</h3>
              <p className="text-gray-600 leading-relaxed">
                Chat directly with current pet owners. Understand the pet's personality first.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
              <div className="bg-pink-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-pink-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Smart Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Filters to help you find pets that match your lifestyle and home size.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Join a supportive network of pet lovers sharing advice and stories.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-green-600">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Verified & Safe</h3>
              <p className="text-gray-600 leading-relaxed">
                We prioritize safety with verified profiles and secure processes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-900">How It Works</h2>
            <p className="text-lg text-gray-600">Three simple steps to finding your new best friend.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: "Create Profile", desc: "Sign up in seconds. Tell us about yourself or the pet you wish to rehome." },
              { title: "Browse & Connect", desc: "Explore profiles, use filters, and start conversations securely." },
              { title: "Adopt & Love", desc: "Meet in person, finalize the adoption, and start your journey together." }
            ].map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-2xl font-bold text-purple-600 mb-6">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      {/* 
          FIXED: Replaced 'bg-slate-900' (which was missing) with 'bg-purple-600'.
          This ensures the white text is visible against a dark background.
      */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden bg-purple-50 px-6 py-20 text-center shadow-2xl">

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
                Ready to Make a Difference?
              </h2>
              {/* text-purple-200 exists in your CSS */}
              <p className="text-xl text-purple-200 mb-10 leading-relaxed">
                Whether you want to adopt a pet or need to find a loving home for one,
                Happy-Tails is the safest place to start.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate("/register")}
                  className="h-12 px-6 text-lg bg-white text-purple-600 hover:bg-purple-50 rounded-full font-medium"
                >
                  Join Happy-Tails
                </Button>
              </div>

              <p className="mt-8 text-sm text-purple-200 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                No hidden fees. 100% Community driven.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="bg-purple-600 p-1.5 rounded-lg">
              <Heart className="h-5 w-5 text-white fill-current" />
            </div>
            <span className="font-semibold text-xl text-gray-900">Happy-Tails</span>
          </div>

          <p>© {new Date().getFullYear()} Happy-Tails. All rights reserved.</p>

          <div className="flex gap-6">
            <span className="cursor-pointer hover:text-purple-600 transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-purple-600 transition-colors">Terms</span>
            <span className="cursor-pointer hover:text-purple-600 transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};