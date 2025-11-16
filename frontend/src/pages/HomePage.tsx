import React, { useState, useEffect } from 'react';
import { Pet } from '../types';
import { PetCard } from '../components/PetCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface HomePageProps {
  onNavigate: (page: string, petId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [vaccinatedFilter, setVaccinatedFilter] = useState<boolean | null>(null);
  const [aiMatchOpen, setAiMatchOpen] = useState(false);
  const [aiPreferences, setAiPreferences] = useState({
    type: '',
    minAge: 0,
    maxAge: 10,
    vaccinated: false
  });

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    filterPets();
  }, [pets, searchQuery, typeFilter, vaccinatedFilter]);

  const loadPets = () => {
    const storedPets = JSON.parse(localStorage.getItem('pets') || '[]');
    const availablePets = storedPets.filter((pet: Pet) => pet.status === 'available');
    setPets(availablePets);
    setFilteredPets(availablePets);
  };

  const filterPets = () => {
    let filtered = [...pets];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(pet =>
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(pet => pet.type.toLowerCase() === typeFilter.toLowerCase());
    }

    // Vaccinated filter
    if (vaccinatedFilter !== null) {
      filtered = filtered.filter(pet => pet.vaccinated === vaccinatedFilter);
    }

    setFilteredPets(filtered);
  };

  const handleAIMatch = () => {
    let matched = [...pets];

    if (aiPreferences.type) {
      matched = matched.filter(pet => pet.type.toLowerCase() === aiPreferences.type.toLowerCase());
    }

    matched = matched.filter(pet => 
      pet.age >= aiPreferences.minAge && pet.age <= aiPreferences.maxAge
    );

    if (aiPreferences.vaccinated) {
      matched = matched.filter(pet => pet.vaccinated);
    }

    // Simple AI scoring (in real app, this would use actual AI)
    const scored = matched.map(pet => ({
      pet,
      score: Math.random() * 100
    })).sort((a, b) => b.score - a.score);

    setFilteredPets(scored.map(s => s.pet));
    setAiMatchOpen(false);
    toast.success(`Found ${scored.length} AI-matched pets for you!`);
  };

  const types = ['all', ...Array.from(new Set(pets.map(p => p.type)))];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Find Your Perfect Pet</h1>
        <p className="text-gray-600">Browse available pets or use AI to find your best match</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, breed, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select 
              value={vaccinatedFilter === null ? 'all' : vaccinatedFilter.toString()} 
              onValueChange={(val) => setVaccinatedFilter(val === 'all' ? null : val === 'true')}
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

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredPets.length} of {pets.length} pets
          </p>

          <Dialog open={aiMatchOpen} onOpenChange={setAiMatchOpen}>
            <DialogTrigger asChild>
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Match
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Find Your Perfect Match</DialogTitle>
                <DialogDescription>
                  Tell us your preferences and our AI will recommend the best pets for you
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div>
                  <Label>Pet Type</Label>
                  <Select value={aiPreferences.type} onValueChange={(val) => setAiPreferences({ ...aiPreferences, type: val })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select pet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="Dog">Dog</SelectItem>
                      <SelectItem value="Cat">Cat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Age Range: {aiPreferences.minAge} - {aiPreferences.maxAge} years</Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex-1">
                      <Label className="text-xs">Min Age</Label>
                      <Slider
                        value={[aiPreferences.minAge]}
                        onValueChange={(val) => setAiPreferences({ ...aiPreferences, minAge: val[0] })}
                        max={10}
                        step={1}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Max Age</Label>
                      <Slider
                        value={[aiPreferences.maxAge]}
                        onValueChange={(val) => setAiPreferences({ ...aiPreferences, maxAge: val[0] })}
                        max={10}
                        step={1}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="vaccinated">Must be vaccinated</Label>
                  <Switch
                    id="vaccinated"
                    checked={aiPreferences.vaccinated}
                    onCheckedChange={(checked) => setAiPreferences({ ...aiPreferences, vaccinated: checked })}
                  />
                </div>

                <Button className="w-full" onClick={handleAIMatch}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Find Matches
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pets Grid */}
      {filteredPets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No pets found matching your criteria</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map(pet => (
            <PetCard
              key={pet.id}
              pet={pet}
              onShowDetails={(petId) => onNavigate('petdetails', petId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
