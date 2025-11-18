import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pet, AdoptionRequest } from '../types';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';

import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../components/ui/alert-dialog';

export const AdoptablesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [addPetOpen, setAddPetOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);

  const [petForm, setPetForm] = useState({
    name: '',
    age: 1,
    weight: 0,
    height: 0,
    breed: '',
    type: 'Dog',
    vaccinated: false,
    address: '',
    description: '',
    images: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80']
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadMyPets();
      loadRequests();
    }
  }, [user]);

  const loadMyPets = () => {
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    const filtered = pets.filter((p: Pet) => p.parentId === user?.id);
    setMyPets(filtered);
  };

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('adoptionRequests') || '[]');
    const myRequests = allRequests.filter(
      (r: AdoptionRequest) => r.parentId === user?.id && r.status === 'pending'
    );
    setRequests(myRequests);
  };

  const handleAddPet = () => {
    if (!user) return;

    if (!petForm.name || !petForm.breed || !petForm.address || !petForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    const newPet: Pet = {
      id: Date.now().toString(),
      parentId: user.id,
      ...petForm,
      status: 'available'
    };

    pets.push(newPet);
    localStorage.setItem('pets', JSON.stringify(pets));

    loadMyPets();
    setAddPetOpen(false);
    resetForm();
    toast.success('Pet added successfully!');
  };

  const handleUpdatePet = () => {
    if (!editingPet) return;

    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    const index = pets.findIndex((p: Pet) => p.id === editingPet.id);

    if (index !== -1) {
      pets[index] = { ...editingPet, ...petForm };
      localStorage.setItem('pets', JSON.stringify(pets));
      loadMyPets();
      setEditingPet(null);
      resetForm();
      toast.success('Pet updated successfully!');
    }
  };

  const handleDeletePet = (petId: string) => {
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    const filtered = pets.filter((p: Pet) => p.id !== petId);
    localStorage.setItem('pets', JSON.stringify(filtered));
    loadMyPets();
    setDeletingPetId(null);
    toast.success('Pet removed from listings');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setPetForm({ ...petForm, images: [result] });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setPetForm({
      name: '',
      age: 1,
      weight: 0,
      height: 0,
      breed: '',
      type: 'Dog',
      vaccinated: false,
      address: '',
      description: '',
      images: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80']
    });
    setImagePreview('');
  };

  const openEditDialog = (pet: Pet) => {
    setEditingPet(pet);
    setPetForm({
      name: pet.name,
      age: pet.age,
      weight: pet.weight,
      height: pet.height,
      breed: pet.breed,
      type: pet.type,
      vaccinated: pet.vaccinated,
      address: pet.address,
      description: pet.description,
      images: pet.images
    });
    setImagePreview(pet.images[0]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl mb-2">My Adoptables</h1>
          <p className="text-gray-600">Manage pets you've listed for adoption</p>
        </div>
        <Button onClick={() => setAddPetOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Pet
        </Button>
      </div>

      {requests.length > 0 && (
        <Card className="mb-8 bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle>You have {requests.length} pending adoption request{requests.length > 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ROUTER REPLACEMENT */}
            <Button onClick={() => navigate('/requests')}>View All Requests</Button>
          </CardContent>
        </Card>
      )}

      {/* My Pets */}
      {myPets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">You haven't listed any pets yet</p>
          <Button onClick={() => setAddPetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Pet
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myPets.map(pet => (
            <Card key={pet.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <ImageWithFallback
                  src={pet.images[0]}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
                <Badge
                  className="absolute top-2 right-2"
                  variant={
                    pet.status === 'adopted'
                      ? 'default'
                      : pet.status === 'pending'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {pet.status}
                </Badge>
              </div>

              <CardContent className="pt-4">
                <h3 className="text-lg">{pet.name}</h3>
                <p className="text-sm text-gray-600">{pet.breed} • {pet.age} years</p>
              </CardContent>

              <CardFooter className="flex gap-2">
                {/* ROUTER VERSION */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/pet/${pet.id}`)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>

                <Button size="sm" variant="outline" onClick={() => openEditDialog(pet)}>
                  <Edit className="h-4 w-4" />
                </Button>

                <Button size="sm" variant="outline" onClick={() => setDeletingPetId(pet.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog, Delete Dialog remain unchanged */}
      {/* ... (unchanged code for dialog, form, delete logic) ... */}

      <AlertDialog open={deletingPetId !== null} onOpenChange={() => setDeletingPetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Pet Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this pet from your adoptables? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingPetId && handleDeletePet(deletingPetId)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
