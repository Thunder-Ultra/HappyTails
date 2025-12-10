import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// UI Components
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../components/ui/dialog';

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

// Icons
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Weight,
  Ruler,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

// Data Constants
const PET_DATA = {
  Dog: ['Golden Retriever', 'Labrador', 'Bulldog', 'Beagle', 'Poodle', 'German Shepherd', 'Husky', 'Pug', 'Mixed Breed', 'Other'],
  Cat: ['Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Ragdoll', 'British Shorthair', 'Sphynx', 'Mixed Breed', 'Other'],
  Bird: ['Parrot', 'Canary', 'Finch', 'Cockatiel', 'Lovebird', 'Other'],
  Rabbit: ['Holland Lop', 'Netherland Dwarf', 'Lionhead', 'Dutch', 'Other'],
  Other: ['Other']
};

export const AdoptablesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Data States
  const [myAdoptables, setMyAdoptables] = useState([]);
  const [requests, setRequests] = useState([]);

  // UI States
  const [addAdoptableOpen, setAddAdoptableOpen] = useState(false);
  const [viewAdoptableOpen, setViewAdoptableOpen] = useState(false);
  const [editingAdoptable, setEditingAdoptable] = useState(null);
  const [viewingAdoptable, setViewingAdoptable] = useState(null);
  const [deletingAdoptableId, setDeletingAdoptableId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [adoptableForm, setAdoptableForm] = useState({
    name: '', age: 1, weight: 0, height: 0, breed: '', type: 'Dog',
    vaccinated: false, address: '', description: '', images: []
  });
  const [imagePreview, setImagePreview] = useState('');

  // --- Helpers ---
  const getToken = () => localStorage.getItem('token');

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanBase = BASE_URL.replace(/\/$/, '');
    return `${cleanBase}/uploads/adoptables/${imagePath}`;
  };

  // --- Data Loading ---
  useEffect(() => {
    if (user) {
      loadMyAdoptables();
      loadRequests();
    }
  }, [user]);

  const loadMyAdoptables = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/adoptables/my`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!response.ok) throw new Error('Failed to fetch adoptables');
      const data = await response.json();
      setMyAdoptables(data);
    } catch (error) {
      console.error("Error loading adoptables:", error);
      toast.error("Could not load your adoptables.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch(`${BASE_URL}/adoptables/adoption-requests`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const allRequests = await response.json();
      const myRequests = allRequests ? allRequests.filter(r => r.caretaker_id === user?.id && r.status === 'pending') : [];
      setRequests(myRequests);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  // --- Handlers ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAdoptableForm(prev => ({ ...prev, images: files }));
      setImagePreview(URL.createObjectURL(files[0]));
    }
  };

  const handleAddAdoptable = async () => {
    if (!user) return;
    if (!adoptableForm.name || !adoptableForm.breed || !adoptableForm.address || !adoptableForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(adoptableForm).forEach(key => {
        if (key === 'images') {
          adoptableForm.images.forEach(file => {
            if (file instanceof File) formData.append('images', file);
          });
        } else {
          formData.append(key, adoptableForm[key]);
        }
      });
      formData.append('caretaker_id', user.id);
      formData.append('status', 'available');

      const response = await fetch(`${BASE_URL}/adoptables`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to add adoptable');

      await loadMyAdoptables();
      setAddAdoptableOpen(false);
      resetForm();
      toast.success('Adoptable added successfully!');
    } catch (error) {
      toast.error('Error adding adoptable');
      console.error(error);
    }
  };

  // const handleUpdateAdoptable = async () => {
  //   if (!editingAdoptable) return;
  //   try {
  //     console.log("editingAdoptable : ", editingAdoptable)
  //     console.log("adoptableForm : ", adoptableForm)
  //     const response = await fetch(`${BASE_URL}/adoptables/${editingAdoptable.id || editingAdoptable._id}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${getToken()}`
  //       },
  //       body: JSON.stringify({ ...editingAdoptable, ...adoptableForm }),
  //     });
  //     if (!response.ok) throw new Error('Failed to update adoptable');
  //     await loadMyAdoptables();
  //     setEditingAdoptable(null);
  //     resetForm();
  //     setAddAdoptableOpen(false);
  //     toast.success('Adoptable updated successfully!');
  //   } catch (error) {
  //     toast.error('Error updating adoptable');
  //   }
  // };

  const handleUpdateAdoptable = async () => {
    if (!editingAdoptable) return;

    try {
      const formData = new FormData();

      // 1. Append all text fields from the form state
      Object.keys(adoptableForm).forEach(key => {
        // Skip 'images' in this loop, we handle them specifically below
        if (key !== 'images') {
          formData.append(key, adoptableForm[key]);
        }
      });

      // 2. Append identifying info if needed (ownership check)
      // formData.append('caretaker_id', user.id);

      // 3. Append New Images
      // Only append if the user actually selected NEW files (File objects)
      if (adoptableForm.images && adoptableForm.images.length > 0) {
        adoptableForm.images.forEach(file => {
          if (file instanceof File) {
            formData.append('images', file);
          }
        });
      }

      // 4. API Call
      const response = await fetch(`${BASE_URL}/adoptables/${editingAdoptable.id || editingAdoptable._id}`, {
        method: 'PUT',
        headers: {
          // IMPORTANT: Do NOT set 'Content-Type': 'application/json'
          // The browser automatically sets it to 'multipart/form-data' with the boundary
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update adoptable');

      await loadMyAdoptables();
      setEditingAdoptable(null);
      resetForm();
      setAddAdoptableOpen(false);
      toast.success('Adoptable updated successfully!');
    } catch (error) {
      console.error("Update Error:", error);
      toast.error('Error updating adoptable');
    }
  };

  const handleDeleteAdoptable = async (adoptableId) => {
    try {
      const response = await fetch(`${BASE_URL}/adoptables/${adoptableId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!response.ok) throw new Error('Failed to delete');
      await loadMyAdoptables();
      setDeletingAdoptableId(null);
      toast.success('Adoptable removed');
    } catch (error) {
      toast.error('Error deleting adoptable');
    }
  };

  const resetForm = () => {
    setAdoptableForm({
      name: '', age: 1, weight: 0, height: 0, breed: '', type: 'Dog',
      vaccinated: false, address: '', description: '', images: []
    });
    setImagePreview('');
  };

  const openEditDialog = (adoptable) => {
    setEditingAdoptable(adoptable);
    setAdoptableForm({
      name: adoptable.name,
      age: adoptable.age,
      weight: adoptable.weight,
      height: adoptable.height,
      breed: adoptable.breed,
      type: adoptable.type || 'Dog',
      vaccinated: adoptable.vaccinated === "Yes" || adoptable.vaccinated === true,
      address: adoptable.address,
      description: adoptable.description,
      images: []
    });
    const firstImage = adoptable.images && adoptable.images.length > 0 ? adoptable.images[0] : '';
    setImagePreview(getImageUrl(firstImage));
    setAddAdoptableOpen(true);
  };

  const openViewDialog = (adoptable) => {
    setViewingAdoptable(adoptable);
    setViewAdoptableOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'type') {
      setAdoptableForm(prev => ({ ...prev, [name]: value, breed: '' }));
    } else {
      setAdoptableForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Styles
  const selectStyle = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const StatusBadge = ({ label, value }) => {
    const isYes = value === 'Yes' || value === true;
    return (
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
        <span className="text-gray-600">{label}</span>
        <Badge variant={isYes ? "default" : "secondary"} className={isYes ? "bg-green-600 hover:bg-green-700 text-white" : ""}>
          {isYes ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
          {isYes ? "Yes" : "No"}
        </Badge>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl mb-2 font-bold tracking-tight">My Adoptables</h1>
          <p className="text-gray-600">Manage pets you've listed for adoption</p>
        </div>
        {myAdoptables.length > 0 && (
          <Button onClick={() => { resetForm(); setAddAdoptableOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Adoptable
          </Button>
        )}
      </div>

      {/* Notifications */}
      {requests.length > 0 && (
        <Card className="mb-8 bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle>You have {requests.length} pending adoption request{requests.length > 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/requests')}>View All Requests</Button>
          </CardContent>
        </Card>
      )}

      {/* Grid Content */}
      {isLoading ? (
        <div className="text-center py-20">Loading adoptables...</div>
      ) : myAdoptables.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-gray-500 text-lg mb-4">You haven't listed any adoptables yet</p>
          <Button onClick={() => { resetForm(); setAddAdoptableOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Adoptable
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myAdoptables.map((adoptable, index) => (
            <Card key={adoptable.id || index} className="overflow-hidden group hover:shadow-md transition-all">
              <div className="relative aspect-square bg-gray-100">
                <ImageWithFallback
                  src={getImageUrl(adoptable.images && adoptable.images.length > 0 ? adoptable.images[0] : null)}
                  alt={adoptable.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 right-2 shadow-sm" variant="secondary">
                  {adoptable.status || 'Available'}
                </Badge>
              </div>

              <CardContent className="pt-4">
                <h3 className="text-lg font-bold">{adoptable.name}</h3>
                <p className="text-sm text-gray-600">
                  {adoptable.type} ({adoptable.breed}) • {adoptable.age} years
                </p>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openViewDialog(adoptable)} className="flex-1">
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEditDialog(adoptable)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDeletingAdoptableId(adoptable.id || adoptable._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* --- VIEW DETAILS DIALOG --- */}
      <Dialog open={viewAdoptableOpen} onOpenChange={setViewAdoptableOpen}>
        <DialogContent className="sm:max-w-[425px] h-[80vh] p-0 flex flex-col gap-0 overflow-hidden">
          {viewingAdoptable && (
            <>
              <DialogHeader className="p-6 pb-4 shrink-0 border-b">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  {viewingAdoptable.name}
                  <Badge variant="outline" className="ml-2 text-sm font-normal">
                    {viewingAdoptable.type}
                  </Badge>
                </DialogTitle>
                <DialogDescription>Detailed information</DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto min-h-0 p-6">

                {/* 
                   FIX: Strict Constraints
                   - h-56: Force container height
                   - w-full: Full width of dialog
                   - overflow-hidden: Cut off anything that escapes
                   - Image Class: !h-full !w-auto !max-w-full !max-h-full
                     These !important classes ensure the image scales down to fit the box.
                */}
                <div className="w-full h-56 bg-gray-50 rounded-lg overflow-hidden mb-6 border shrink-0 flex items-center justify-center">
                  <ImageWithFallback
                    src={getImageUrl(viewingAdoptable.images && viewingAdoptable.images.length > 0 ? viewingAdoptable.images[0] : null)}
                    alt={viewingAdoptable.name}
                    className="!h-full !w-auto !max-w-full !max-h-full object-contain mx-auto"
                  />
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700"><strong>Age:</strong> {viewingAdoptable.age} yrs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Weight className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700"><strong>Weight:</strong> {viewingAdoptable.weight || '-'} kg</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Info className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 truncate"><strong>Breed:</strong> {viewingAdoptable.breed}</span>
                    </div>
                  </div>

                  {viewingAdoptable.address && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700 break-words">{viewingAdoptable.address}</span>
                    </div>
                  )}

                  {viewingAdoptable.description && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-900">Description</h4>
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 break-words">
                        {viewingAdoptable.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-gray-900">Health & Behavior</h4>
                    <div className="flex flex-col gap-2">
                      <StatusBadge label="Vaccinated" value={viewingAdoptable.vaccinated} />
                      <StatusBadge label="De-wormed" value={viewingAdoptable.de_wormed} />
                      <StatusBadge label="Sterilized" value={viewingAdoptable.sterilized} />
                      <StatusBadge label="House Trained" value={viewingAdoptable.house_trained} />
                      <StatusBadge label="Pet Friendly" value={viewingAdoptable.pet_friendly} />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-6 border-t bg-gray-50 shrink-0">
                <Button onClick={() => setViewAdoptableOpen(false)} className="w-full sm:w-auto">Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* --- ADD / EDIT DIALOG --- */}
      <Dialog open={addAdoptableOpen} onOpenChange={setAddAdoptableOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAdoptable ? 'Edit Adoptable' : 'Add New Adoptable'}</DialogTitle>
            <DialogDescription>
              {editingAdoptable ? "Update the details below." : "Enter details for the new adoptable."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid gap-2">
              <Label htmlFor="images">Pet Images</Label>
              <div className="flex items-center gap-4">
                <Input id="images" type="file" multiple accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
                {imagePreview && (
                  <div className="h-10 w-10 rounded overflow-hidden border">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={adoptableForm.name} onChange={handleFormChange} placeholder="Name" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <select id="type" name="type" value={adoptableForm.type} onChange={handleFormChange} className={selectStyle}>
                  {Object.keys(PET_DATA).map((type) => (<option key={type} value={type}>{type}</option>))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="breed">Breed</Label>
                <select id="breed" name="breed" value={adoptableForm.breed} onChange={handleFormChange} className={selectStyle} disabled={!adoptableForm.type}>
                  <option value="" disabled>Select Breed</option>
                  {PET_DATA[adoptableForm.type]?.map((breed) => (<option key={breed} value={breed}>{breed}</option>))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="age">Age (years)</Label>
                <Input id="age" name="age" type="number" min="0" value={adoptableForm.age} onChange={handleFormChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" name="weight" type="number" min="0" value={adoptableForm.weight} onChange={handleFormChange} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={adoptableForm.address} onChange={handleFormChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={adoptableForm.description} onChange={handleFormChange} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={editingAdoptable ? handleUpdateAdoptable : handleAddAdoptable}>
              {editingAdoptable ? 'Save Changes' : 'Add Adoptable'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DELETE ALERT --- */}
      <AlertDialog open={deletingAdoptableId !== null} onOpenChange={() => setDeletingAdoptableId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Adoptable Listing</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingAdoptableId && handleDeleteAdoptable(deletingAdoptableId)}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};