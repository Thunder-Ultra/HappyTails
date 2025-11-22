import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Pet } from "../types";
import { PetCard } from "../components/PetCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { token, user, loginWithToken, logout, loading } = useAuth();

  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [vaccinatedFilter, setVaccinatedFilter] = useState<boolean | null>(null);

  const [aiMatchOpen, setAiMatchOpen] = useState(false);
  const [aiPreferences, setAiPreferences] = useState({
    type: "",
    minAge: 0,
    maxAge: 10,
    vaccinated: false,
  });

  // ------------------------------------------------------------------
  // ✔ FIX: Do NOT redirect until AuthContext finishes loading!
  // ------------------------------------------------------------------
  useEffect(() => {
    if (loading) return; // wait

    if (!token) {
      navigate("/login");
      return;
    }

    // if (!loading && !token) {
    //   navigate("/login");
    //   // return;
    // }

    
    const verifyUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          logout();
          toast.error("Session expired. Please log in again.");
          navigate("/login");
          return;
        }

        const userData = await res.json();
        loginWithToken(token, userData);
      } catch (err) {
        console.error(err);
        toast.error("Unable to verify session.");
        navigate("/login");
      }
    };

    verifyUser();
  }, [loading, token, navigate, logout, loginWithToken]);

  // ------------------------------------------------------------------
  // Load adoptables AFTER auth verification
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!token) return;
    if (loading) return;

    const loadAdoptables = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/adoptables?page=1&limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          toast.error("Unable to load adoptables.");
          return;
        }

        const data = await res.json();

        const formatted = data.adoptables.map((p: any) => ({
          id: p.adoptable_id,
          name: p.name,
          breed: p.breed_name || "",
          type: p.type_name || "",
          vaccinated: p.vaccinated === "Yes",
          age: p.age ?? 1,
          image: p.image || "/placeholder.png",
          status: "available",
        }));

        setPets(formatted);
        setFilteredPets(formatted);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load pets.");
      }
    };

    loadAdoptables();
  }, [loading, token]);

  // ------------------------------------------------------------------
  // Filters
  // ------------------------------------------------------------------
  useEffect(() => {
    let filtered = [...pets];

    if (searchQuery) {
      filtered = filtered.filter(
        (pet) =>
          pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (pet) => pet.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    if (vaccinatedFilter !== null) {
      filtered = filtered.filter((pet) => pet.vaccinated === vaccinatedFilter);
    }

    setFilteredPets(filtered);
  }, [pets, searchQuery, typeFilter, vaccinatedFilter]);

  // ------------------------------------------------------------------
  // AI Match
  // ------------------------------------------------------------------
  const handleAIMatch = () => {
    let matched = [...pets];

    if (aiPreferences.type) {
      matched = matched.filter(
        (pet) => pet.type.toLowerCase() === aiPreferences.type.toLowerCase()
      );
    }

    matched = matched.filter(
      (pet) =>
        pet.age >= aiPreferences.minAge && pet.age <= aiPreferences.maxAge
    );

    if (aiPreferences.vaccinated) {
      matched = matched.filter((pet) => pet.vaccinated);
    }

    const scored = matched
      .map((pet) => ({ pet, score: Math.random() * 100 }))
      .sort((a, b) => b.score - a.score);

    setFilteredPets(scored.map((s) => s.pet));
    setAiMatchOpen(false);

    toast.success(`Found ${scored.length} matches!`);
  };

  // ------------------------------------------------------------------
  // UI BLOCKS
  // ------------------------------------------------------------------
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  if (!token) return null; // prevent flicker

  const types = ["all", ...new Set(pets.map((p) => p.type))];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Find Your Perfect Pet</h1>
        <p className="text-gray-600">Browse adoptables or use AI Match</p>
      </div>

      {/* FILTERS + AI */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, breed, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <Select value={typeFilter} onValueChange={(val: string) => setTypeFilter(val)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? "All Types" : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vaccination Filter */}
          <div>
            <Select
              value={vaccinatedFilter === null ? "all" : vaccinatedFilter.toString()}
              onValueChange={(val: string) =>
                setVaccinatedFilter(val === "all" ? null : val === "true")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Vaccination Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Vaccinated</SelectItem>
                <SelectItem value="false">Not Vaccinated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AI Match Button */}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredPets.length} of {pets.length}
          </p>

          <Dialog open={aiMatchOpen} onOpenChange={setAiMatchOpen}>
            <DialogTrigger asChild>
              <Button>
                <Sparkles className="h-4 w-4 mr-2" /> AI Match
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Find Your Best Match</DialogTitle>
                <DialogDescription>
                  Tell us your preferences and we’ll match adoptables.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Pet Type */}
                <div>
                  <Label>Pet Type</Label>
                  <Select
                    value={aiPreferences.type}
                    onValueChange={(val: string) =>
                      setAiPreferences({ ...aiPreferences, type: val })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="Dog">Dog</SelectItem>
                      <SelectItem value="Cat">Cat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Range */}
                <div>
                  <Label>
                    Age Range: {aiPreferences.minAge} - {aiPreferences.maxAge}
                  </Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex-1">
                      <Label className="text-xs">Min Age</Label>
                      <Slider
                        value={[aiPreferences.minAge]}
                        max={10}
                        step={1}
                        onValueChange={(val: number[]) =>
                          setAiPreferences({ ...aiPreferences, minAge: val[0] })
                        }
                      />
                    </div>

                    <div className="flex-1">
                      <Label className="text-xs">Max Age</Label>
                      <Slider
                        value={[aiPreferences.maxAge]}
                        max={10}
                        step={1}
                        onValueChange={(val: number[]) =>
                          setAiPreferences({ ...aiPreferences, maxAge: val[0] })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Vaccinated */}
                <div className="flex items-center justify-between">
                  <Label>Must be vaccinated</Label>
                  <Switch
                    checked={aiPreferences.vaccinated}
                    onCheckedChange={(checked: boolean) =>
                      setAiPreferences({ ...aiPreferences, vaccinated: checked })
                    }
                  />
                </div>

                <Button className="w-full" onClick={handleAIMatch}>
                  <Sparkles className="h-4 w-4 mr-2" /> Find Matches
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* PETS GRID */}
      {filteredPets.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-lg">
          No adoptables found.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onShowDetails={(id: string) => navigate(`/pet/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
