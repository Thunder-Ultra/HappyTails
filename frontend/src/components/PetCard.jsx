import React from 'react';
import { Pet } from '../types';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, CheckCircle } from 'lucide-react';

export const PetCard = ({ pet, onShowDetails, showStatus = false }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative aspect-square overflow-hidden" onClick={() => onShowDetails(pet.id)}>
        <ImageWithFallback
          src={pet.images[0]}
          alt={pet.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {pet.vaccinated && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full">
            <CheckCircle className="h-4 w-4" />
          </div>
        )}
        {showStatus && pet.status !== 'available' && (
          <div className="absolute top-2 left-2">
            <Badge variant={pet.status === 'adopted' ? 'default' : 'secondary'}>
              {pet.status}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">

            <h3 className="text-lg">{pet.name}</h3>
            <p className="text-sm text-gray-600">{pet.breed}</p>
          </div>
          <Badge variant="outline">{pet.age} {pet.age === 1 ? 'year' : 'years'}</Badge>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{pet.address.split(',')[0]}</span>
        </div>
      </CardContent>

        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => onShowDetails(pet.id)}
        >
          Show More Details
        </Button>
      </CardFooter>
    </Card>
  );
};
