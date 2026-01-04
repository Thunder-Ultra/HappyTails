import React from 'react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, CheckCircle, User } from 'lucide-react'; // Added User icon

export const PetCard = ({ pet, onShowDetails, showStatus = false }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group rounded-2xl border-gray-100">
      <div className="relative aspect-square overflow-hidden" onClick={() => onShowDetails(pet.id)}>
        <ImageWithFallback
          src={pet.image || "/placeholder.png"}
          alt={pet.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {pet.vaccinated && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-sm">
            <CheckCircle className="h-3 w-3" />
          </div>
        )}
      </div>

      <CardContent className="pt-4 px-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
          <Badge variant="outline" className="text-[10px] font-bold">
            {pet.age || 0} {pet.age === 1 ? 'year' : 'years'}
          </Badge>
        </div>

        <p className="text-xs font-semibold text-blue-600 uppercase tracking-tight">
          {pet.type} • {pet.breed}
        </p>

        {/* --- ADDED: CARETAKER NAME --- */}
        <div className="flex items-center gap-1.5 mt-3 text-gray-500">
          <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-3 w-3 text-gray-400" />
          </div>
          <span className="text-xs font-medium">
            Listed by <span className="text-gray-700 font-bold">{pet.caretaker_name}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-2">
          <MapPin className="h-3 w-3" />
          <span className="truncate">
            {pet.town_city ? `${pet.town_city}, ${pet.state}` : "Location N/A"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0">
        <Button
          className="w-full cursor-pointer h-10 rounded-xl font-bold"
          variant="outline"
          onClick={() => onShowDetails(pet.id)}
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
};