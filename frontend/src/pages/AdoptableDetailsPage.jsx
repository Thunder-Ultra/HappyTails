import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { formatDate } from "../utils/formatters";

// UI Components
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// Icons
import {
  ArrowLeft, MapPin, Heart, Loader2, Calendar, Weight, Info,
  ShieldCheck, Activity, Users, Home, Smile, X, Send
} from "lucide-react";

import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "../components/ui/carousel";

export default function AdoptableDetailsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [adoptable, setAdoptable] = useState(null);
  const [myRequest, setMyRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- INTEREST MODAL STATES ---
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [interestMessage, setInterestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id, token]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Adoptable Details
      const res = await fetch(`${BASE_URL}/adoptables/item/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // console.log(data);
      if (!res.ok) throw new Error(data.message || "Adoptable not found");
      setAdoptable(data);

      // 2. Check if current user has already applied
      if (token) {
        const reqRes = await fetch(`${BASE_URL}/adoption/my-applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const applications = await reqRes.json();
        if (Array.isArray(applications)) {
          const existingReq = applications.find((a) => a.pet_id === parseInt(id));
          setMyRequest(existingReq || null);
        }
      }
    } catch (err) {
      toast.error(err.message);
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async (e) => {
    e.preventDefault();
    if (!interestMessage.trim()) {
      toast.error("Please enter a message for the caretaker.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/adoption/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adoptable_id: adoptable.id,
          message: interestMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to send request");

      toast.success("Application sent successfully!");
      setIsInterestModalOpen(false);
      loadData(); // Refresh to show status
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  if (!adoptable) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" className="mb-6 hover:bg-white rounded-full px-4 cursor-pointer" onClick={() => navigate("/home")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Browse
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT: IMAGE VIEWER */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
                {adoptable.images.length <= 1 ? (
                  <ImageWithFallback
                    src={adoptable.images[0] ? `${BASE_URL}/uploads/${adoptable.images[0]}` : null}
                    alt={adoptable.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Carousel className="w-full h-full">
                    <CarouselContent className="h-full">
                      {adoptable.images.map((img, i) => (
                        <CarouselItem key={i} className="h-full">
                          <img src={`${BASE_URL}/uploads/${img}`} alt={adoptable.name} className="w-full h-full object-cover" />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </Carousel>
                )}
              </div>

              {/* Caretaker Info */}
              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold uppercase">
                  {adoptable.caretaker_name?.charAt(0) || "C"}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">Caretaker</p>
                  <p className="font-semibold text-gray-900">{adoptable.caretaker_name || "Pet Parent"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Badge className="bg-primary text-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md">
                  {adoptable.status}
                </Badge>
                <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                  <MapPin className="h-3.5 w-3.5 text-red-500" />
                  {adoptable.town_city ? `${adoptable.town_city}, ${adoptable.state}` : "Location not provided"}
                </div>
              </div>
              <h1 className="text-5xl font-semibold text-gray-900 tracking-tight">{adoptable.name}</h1>
              <p className="text-xl text-blue-600 font-medium">{adoptable.type_name} • {adoptable.breed_name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Born', val: adoptable.dob ? formatDate(adoptable.dob) : 'N/A', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'Gender', val: adoptable.gender, icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
                { label: 'Weight', val: adoptable.weight_kg > 0 ? `${adoptable.weight_kg} kg` : 'N/A', icon: Weight, color: 'text-blue-500', bg: 'bg-blue-50' }
              ].map((stat, i) => (
                <div key={i} className={`${stat.bg} p-4 rounded-xl border border-white shadow-sm flex flex-col items-center text-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="font-semibold text-gray-900 text-sm mt-0.5">{stat.val}</p>
                </div>
              ))}
            </div>

            {/* About */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                <Smile className="h-4 w-4 text-yellow-500" /> Personality
              </h3>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-gray-600 leading-relaxed">
                {adoptable.description || "No description provided yet."}
              </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'Vaccinated', val: adoptable.vaccinated, icon: Activity },
                { label: 'Sterilized', val: adoptable.sterilized, icon: Info },
                { label: 'House Trained', val: adoptable.house_trained, icon: Home }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-gray-300" />
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">{item.label}</span>
                  </div>
                  <Badge variant="secondary" className="px-2 py-0.5 text-[11px] font-semibold bg-gray-50">{item.val}</Badge>
                </div>
              ))}
            </div>

            {/* ACTION SECTION */}
            <div className="pt-6">
              {!token ? (
                <Button className="w-full h-14 bg-primary text-white rounded-xl font-bold cursor-pointer" onClick={() => navigate("/login")}>
                  Log in to Adopt {adoptable.name}
                </Button>
              ) : adoptable.caretaker_id === user?.id ? (
                <Button className="w-full h-14 bg-gray-100 text-gray-900 rounded-xl font-bold border border-gray-200 cursor-pointer" onClick={() => navigate("/adoptables")}>
                  Manage Your Listing
                </Button>
              ) : !myRequest ? (
                <Button
                  className="w-full h-16 bg-primary hover:bg-black text-white rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer"
                  onClick={() => setIsInterestModalOpen(true)}
                >
                  <Heart className="h-6 w-6 fill-white" />
                  I'm Interested in {adoptable.name}
                </Button>
              ) : (
                <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] text-center">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Your Application Status</p>
                  <h2 className="text-3xl font-bold text-blue-800 capitalize">{myRequest.status}</h2>
                  <p className="text-sm text-blue-600/70 mt-4">You can manage this request in your profile dashboard.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- INTEREST MODAL --- */}
      <Dialog open={isInterestModalOpen} onOpenChange={setIsInterestModalOpen}>
        <DialogContent className="max-w-md bg-white p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <div className="p-8 border-b bg-gray-50/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Introduce Yourself</DialogTitle>
              <DialogDescription className="text-gray-500 font-medium">
                Send a short message to <span className="text-blue-600 font-bold">{adoptable.caretaker_name}</span> about why you want to adopt {adoptable.name}.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSendInterest} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Your Message</Label>
              <Textarea
                placeholder="Hi! We have a large yard and plenty of time to play with Tommy..."
                className="min-h-[150px] rounded-2xl border-gray-100 bg-gray-50 p-4 focus:bg-white transition-all text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-500"
                value={interestMessage}
                onChange={(e) => setInterestMessage(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl cursor-pointer" onClick={() => setIsInterestModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white font-bold h-12 rounded-xl shadow-lg active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <><Send className="h-4 w-4 mr-2" /> Send Request</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}