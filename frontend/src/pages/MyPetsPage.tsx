import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { Pet } from "../types"; // <-- Make sure Pet contains status, images, etc.

import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Eye } from "lucide-react";

export default function MyPetsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [myPets, setMyPets] = useState<Pet[]>([]);

  useEffect(() => {
    if (user) loadMyPets();
  }, [user]);

  const loadMyPets = () => {
    const pets: Pet[] = JSON.parse(localStorage.getItem("pets") || "[]");

    // Pets adopted by the user
    const adoptedPets = pets.filter((p: Pet) => p.adoptedBy === user?.id);

    if (user?.role === "parent") {
      // Pets listed by the parent
      const listedPets = pets.filter((p: Pet) => p.parentId === user?.id);

      // Merge without duplicates
      const combined: Pet[] = [...adoptedPets];

      listedPets.forEach((pet: Pet) => {
        if (!combined.find((p: Pet) => p.id === pet.id)) {
          combined.push(pet);
        }
      });

      setMyPets(combined);
    } else {
      setMyPets(adoptedPets);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">My Pets</h1>
        <p className="text-gray-600">
          View and manage your pets' health records
        </p>
      </div>

      {/* Empty State */}
      {myPets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">
            You don't have any pets yet
          </p>

          <Button onClick={() => navigate("/home")}>
            Browse Available Pets
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myPets.map((pet: Pet) => (
            <Card
              key={pet.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-square">
                <ImageWithFallback
                  src={pet.images[0]}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />

                <Badge
                  className="absolute top-2 right-2"
                  variant={pet.status === "adopted" ? "default" : "outline"}
                >
                  {pet.status}
                </Badge>
              </div>

              <CardContent className="pt-4">
                <h3 className="text-lg">{pet.name}</h3>
                <p className="text-sm text-gray-600">
                  {pet.breed} • {pet.age} years
                </p>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate(`/petprofile/${pet.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Health Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
