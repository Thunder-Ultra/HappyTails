import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PetCard } from "../components/PetCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { Search, SlidersHorizontal, Loader2, PawPrint } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export const HomePage = () => {
  const navigate = useNavigate();
  const { token, loading: authLoading } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [pets, setPets] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  // Consolidated Filters
  const [filters, setFilters] = useState({
    search: "",
    type_id: "all",
    gender: "all",
    minAge: 0,
    maxAge: 15,
    vaccinated: false,
  });

  const loadAdoptables = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.type_id !== "all") params.append("type_id", filters.type_id);
      if (filters.gender !== "all") params.append("gender", filters.gender);
      if (filters.minAge > 0) params.append("minAge", filters.minAge);
      if (filters.maxAge < 15) params.append("maxAge", filters.maxAge);
      if (filters.vaccinated) params.append("vaccinated", "true");
      params.append("limit", "50");

      const res = await fetch(`${BASE_URL}/adoptables?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load");
      // console.log(data)

      const formatted = data.adoptables.map((p) => {
        // Create a safe array of images for the PetCard to read
        const imagesArray = p.primary_image ? [p.primary_image] : [];

        return {
          ...p,
          breed: p.breed || "Unknown",
          type: p.type || "Other",
          // Ensure 'images' exists as an array so PetCard can read index [0]
          caretaker_name: p.caretaker_name || "Pet Parent", // Ensure this is passed
          images: imagesArray,
          // Set the main display image
          image: p.primary_image ? `${BASE_URL}/uploads/${p.primary_image}` : "/placeholder.png",
        };
      });

      setPets(formatted);
    } catch (err) {
      toast.error("Failed to load pets.");
    } finally {
      setDataLoading(false);
    }
  }, [token, BASE_URL, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (token && !authLoading) loadAdoptables();
    }, 400); // Debounce typing
    return () => clearTimeout(timer);
  }, [loadAdoptables, authLoading, token]);

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!token) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Find a Friend</h1>
          <p className="text-gray-500">Discover loving pets ready for adoption near you.</p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, breed..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10 h-12 bg-gray-50 border-none rounded-xl"
          />
        </div>

        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50">
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Advanced Filters
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl fit-content">
            <DialogHeader>
              <DialogTitle>Refine Search</DialogTitle>
              <DialogDescription>Adjust parameters to find the perfect match.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={filters.gender} onValueChange={(v) => setFilters({ ...filters, gender: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-8">
                  <Label>Vaccinated</Label>
                  <Switch checked={filters.vaccinated} onCheckedChange={(v) => setFilters({ ...filters, vaccinated: v })} />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Age Range (Years): {filters.minAge} - {filters.maxAge}</Label>
                <Slider
                  defaultValue={[filters.minAge, filters.maxAge]}
                  max={4}
                  step={1}
                  onValueChange={([min, max]) => setFilters({ ...filters, minAge: min, maxAge: max })}
                />
              </div>

              <Button className="w-full h-12 bg-black text-white rounded-xl font-bold" onClick={() => setSearchOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* RESULTS GRID */}
      {dataLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-3xl" />)}
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-[2.5rem] border-2 border-dashed">
          <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">No pets found</h2>
          <Button variant="link" onClick={() => setFilters({ search: "", type_id: "all", gender: "all", minAge: 0, maxAge: 15, vaccinated: false })}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onShowDetails={(id) => navigate(`/adoptable/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};