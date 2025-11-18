import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ArrowLeft, MapPin, Heart, CheckCircle } from 'lucide-react';

const PetDetailsPage = ({ petId, onNavigate }) => {
  const { user } = useAuth();
  const [pet, setPet] = useState(null);

  useEffect(() => {
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    const found = pets.find((p) => p.id === petId);
    setPet(found || null);
  }, [petId]);

  const handleAdoptionRequest = () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if (!pet) return;

    const requests = JSON.parse(localStorage.getItem('adoptionRequests') || '[]');
    const existing = requests.find((r) => r.petId === pet.id && r.adopterId === user.id && r.status === 'pending');
    if (existing) {
      alert('You have already sent an adoption request for this pet.');
      return;
    }

    const newRequest = {
      id: Date.now().toString(),
      petId: pet.id,
      adopterId: user.id,
      parentId: pet.parentId || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    localStorage.setItem('adoptionRequests', JSON.stringify(requests));
    alert('Adoption request sent!');
  };

  if (!pet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="mb-4">Pet not found.</p>
        <Button onClick={() => onNavigate('home')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => onNavigate('home')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Browse
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {pet.images && pet.images.length > 0 ? (
            <div className="rounded-xl overflow-hidden">
              <ImageWithFallback src={pet.images[0]} alt={pet.name} className="w-full aspect-square object-cover" />
            </div>
          ) : (
            <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg">No image</div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold">{pet.name}</h1>
              <p className="text-lg text-gray-600">{pet.breed}</p>
            </div>
            <Badge variant={pet.status === 'available' ? 'default' : 'secondary'} className="text-sm">
              {pet.status}
            </Badge>
          </div>

          {pet.vaccinated && (
            <div className="flex items-center gap-2 text-green-600 mb-6">
              <CheckCircle className="h-5 w-5" />
              <span>Fully Vaccinated</span>
            </div>
          )}

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{pet.age} {pet.age === 1 ? 'year' : 'years'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{pet.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{pet.weight} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="font-medium">{pet.height} cm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h2 className="text-xl mb-3">About {pet.name}</h2>
            <p className="text-gray-700 leading-relaxed">{pet.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl mb-3">Location</h2>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <p className="text-gray-700">{pet.address}</p>
            </div>
          </div>

          {pet.status === 'available' && user && user.role === 'adopter' && (
            <Button className="w-full" size="lg" onClick={handleAdoptionRequest}>
              <Heart className="h-5 w-5 mr-2" />
              Interested — I want to adopt {pet.name}
            </Button>
          )}

          {!user && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-center text-sm">
                <button onClick={() => onNavigate('login')} className="text-purple-600 hover:underline">Sign in</button>
                {' '}or{' '}
                <button onClick={() => onNavigate('register')} className="text-purple-600 hover:underline">create an account</button>
                {' '}to adopt this pet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetDetailsPage;
