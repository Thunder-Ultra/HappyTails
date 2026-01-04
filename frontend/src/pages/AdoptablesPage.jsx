import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { formatDate, formatDateForInput } from "../utils/formatters";

// UI Components
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// Icons
import {
  Plus, Edit, Trash2, X, Loader2, Stethoscope, Info, CheckCircle, Calendar, Upload, Eye, AlertTriangle
} from 'lucide-react';

export const AdoptablesPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // --- DATA STATES ---
  const [myAdoptables, setMyAdoptables] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableBreeds, setAvailableBreeds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- MODAL & EDIT STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --- IMAGE MANAGEMENT STATES ---
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  // --- DELETE STATES ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adoptableToDelete, setAdoptableToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Variable set to adoptableData
  const [adoptableData, setAdoptableData] = useState({
    name: '', gender: 'Male', dob: '', weight_kg: '', type_id: '', breed_id: '',
    description: '', sterilized: 'Unknown', vaccinated: 'Unknown',
    last_vaccine_date: '', de_wormed: 'Unknown', house_trained: 'In-Training',
    status: 'Available'
  });

  // --- DATA LOADING ---
  useEffect(() => {
    if (user && token) {
      loadMyAdoptables();
      loadAdoptableTypes();
    }
  }, [user, token]);

  useEffect(() => {
    if (adoptableData.type_id) loadBreeds(adoptableData.type_id);
    else setAvailableBreeds([]);
  }, [adoptableData.type_id]);

  const loadAdoptableTypes = async () => {
    try {
      const res = await fetch(`${BASE_URL}/public/pet-types`);
      if (res.ok) setAvailableTypes(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadBreeds = async (typeId) => {
    try {
      const res = await fetch(`${BASE_URL}/public/pet-breeds?typeId=${typeId}`);
      if (res.ok) setAvailableBreeds(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadMyAdoptables = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/adoptables/my-listings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMyAdoptables(data);
    } catch (err) {
      toast.error("Could not load your listings.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "type_id") setAdoptableData(prev => ({ ...prev, type_id: value, breed_id: "" }));
    else setAdoptableData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const currentTotal = existingImages.length + newFiles.length;
    if (currentTotal + files.length > 5) {
      toast.error(`Limit exceeded. Max 5 images total.`);
      e.target.value = "";
      return;
    }
    setNewFiles(prev => [...prev, ...files]);
  };

  const removeExistingImage = (filename) => {
    setExistingImages(prev => prev.filter(img => img !== filename));
  };

  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openEditModal = (adoptable) => {
    setIsEditMode(true);
    setEditingId(adoptable.id);
    setAdoptableData({
      ...adoptable,
      dob: formatDateForInput(adoptable.dob),
      last_vaccine_date: formatDateForInput(adoptable.last_vaccine_date),
      type_id: adoptable.type_id?.toString() || "",
      breed_id: adoptable.breed_id?.toString() || ""
    });
    setExistingImages(adoptable.images || []);
    setNewFiles([]);
    setIsModalOpen(true);
  };

  const openDeleteModal = (adoptable) => {
    setAdoptableToDelete(adoptable);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setExistingImages([]);
    setNewFiles([]);
    setAdoptableData({
      name: '', gender: 'Male', dob: '', weight_kg: '', type_id: '', breed_id: '',
      description: '', sterilized: 'Unknown', vaccinated: 'Unknown',
      last_vaccine_date: '', de_wormed: 'Unknown', house_trained: 'In-Training',
      status: 'Available'
    });
  };

  const handleConfirmDelete = async () => {
    if (!adoptableToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/adoptables/${adoptableToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete listing");
      toast.success("Listing removed successfully");
      setIsDeleteModalOpen(false);
      setAdoptableToDelete(null);
      loadMyAdoptables();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const dataToSend = new FormData();
      Object.keys(adoptableData).forEach(key => {
        dataToSend.append(key, adoptableData[key] || "");
      });
      newFiles.forEach(file => dataToSend.append('images', file));
      dataToSend.append('remainingImages', JSON.stringify(existingImages));

      const url = isEditMode ? `${BASE_URL}/adoptables/${editingId}` : `${BASE_URL}/adoptables`;
      const res = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: dataToSend,
      });

      if (!res.ok) throw new Error('Failed to save listing');
      toast.success(isEditMode ? 'Listing updated!' : 'Adoptable listed successfully!');
      closeModal();
      loadMyAdoptables();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">My Adoptables</h1>
          <p className="text-gray-500 mt-1">Manage the listings you've shared with the community</p>
        </div>
        <Button onClick={() => { setIsEditMode(false); setIsModalOpen(true); }} className="cursor-pointer bg-primary text-white font-medium px-6 py-2 rounded-md shadow-md active:opacity-70">
          <Plus className="h-4 w-4 mr-2" /> Add Adoptable
        </Button>
      </div>

      {/* GRID SECTION */}
      {isLoading && myAdoptables.length === 0 ? (
        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto h-10 w-10 text-blue-600" /></div>
      ) : myAdoptables.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-lg bg-gray-50">
          <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-6 font-medium text-lg">No adoptables listed yet.</p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="cursor-pointer">Start a Listing</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {myAdoptables.map((adoptable) => (
            <Card key={adoptable.id} className="overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 group relative">

              <div className="absolute top-2 right-3 z-20 flex gap-2">
                <button
                  onClick={() => openDeleteModal(adoptable)}
                  className="bg-black/50 hover:bg-purple/50 text-white p-2 rounded-lg shadow-lg cursor-pointer transition-all active:scale-90 z-50"
                  title="Delete Listing"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <ImageWithFallback
                  src={adoptable.images?.[0] ? `${BASE_URL}/uploads/${adoptable.images[0]}` : null}
                  alt={adoptable.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-black/80 text-white border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    {adoptable.status}
                  </Badge>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button
                    size="sm"
                    className="w-full cursor-pointer bg-white hover:bg-white text-gray-900 font-bold shadow-lg"
                    onClick={() => openEditModal(adoptable)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" /> Edit Details
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 truncate">{adoptable.name}</h3>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 mt-1">
                  {adoptable.type} • {adoptable.breed}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="px-3 py-1.5 border-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                    {adoptable.gender}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1.5 border-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                    {formatDate(adoptable.dob)}
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="px-6 pb-6 pt-0">
                <Button variant="outline" className="w-full cursor-pointer h-10 rounded-xl border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all" onClick={() => navigate(`/adop-requests/${adoptable.id}`)}>
                  <Eye className="h-4 w-4 mr-2" /> View Requests
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}


      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          {/* Main Container: Rounded-2xl and Max-w-3xl from your CSS */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in duration-200">

            {/* STICKY HEADER: Rounded top corners to match parent */}
            <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 leading-none">
                    {isEditMode ? 'Edit Adoptable' : 'New Adoptable Listing'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Update the details for <span className="font-semibold text-blue-600">{adoptableData.name || 'this adoptable'}</span>.
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="cursor-pointer hover:bg-gray-100 p-1.5 rounded-md transition-colors text-gray-400"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* FORM BODY: Standardized px-6 gutter to prevent edge-touching */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[70vh] bg-white px-6 py-4 space-y-8">

              {/* SECTION: BASIC INFORMATION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-blue-100">
                  <Plus className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 uppercase ml-1">Adoptable Name *</Label>
                    <Input name="name" className="h-10 rounded-md border border-gray-100 bg-gray-50 px-3 focus:bg-white transition-all" value={adoptableData.name} onChange={handleInputChange} required />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 uppercase ml-1">Gender *</Label>
                    <select name="gender" value={adoptableData.gender} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* DOB Input Added Here */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 uppercase ml-1">Date of Birth</Label>
                    <Input
                      type="date"
                      name="dob"
                      className="h-10 rounded-md border border-gray-100 bg-gray-50 px-3 focus:bg-white transition-all"
                      value={adoptableData.dob}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Weight Input (optional based on your state having weight_kg) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 uppercase ml-1">Weight (kg)</Label>
                    <Input
                      type="number"
                      name="weight_kg"
                      className="h-10 rounded-md border border-gray-100 bg-gray-50 px-3 focus:bg-white transition-all"
                      value={adoptableData.weight_kg}
                      onChange={handleInputChange}
                      placeholder="e.g. 5"
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 uppercase ml-1">Type *</Label>
                    <select name="type_id" value={adoptableData.type_id} onChange={handleInputChange} required className="flex h-10 w-full rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm outline-none">
                      <option value="">Select Type</option>
                      {availableTypes.map(t => <option key={t.id} value={t.id.toString()}>{t.name}</option>)}
                    </select>
                  </div>

                  {/* Breed */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 uppercase ml-1">Breed *</Label>
                    <select name="breed_id" value={adoptableData.breed_id} onChange={handleInputChange} disabled={!adoptableData.type_id} className="flex h-10 w-full rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm outline-none disabled:opacity-50">
                      <option value="">Select Breed</option>
                      {availableBreeds.map(b => <option key={b.id} value={b.id.toString()}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: HEALTH & BEHAVIOR */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-green-100">
                  <Stethoscope className="h-4 w-4 text-green-600" />
                  <h3 className="text-xs font-semibold text-green-600 uppercase tracking-widest">Health & Behavior</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500">Vaccinated?</Label>
                    <select name="vaccinated" value={adoptableData.vaccinated} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                      <option value="Unknown">Unknown</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Partially">Partially</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500">Sterilized?</Label>
                    <select name="sterilized" value={adoptableData.sterilized} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                      <option value="Unknown">Unknown</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500">House Trained?</Label>
                    <select name="house_trained" value={adoptableData.house_trained} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                      <option value="In-Training">In-Training</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: PHOTOS & DESCRIPTION */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-widest">Adoptable Photos ({existingImages.length + newFiles.length}/5)</Label>

                  {/* Small Thumbnails */}
                  <div className="flex flex-wrap gap-3 mb-3">
                    {existingImages.map((img) => (
                      <div key={img} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                        <img src={`${BASE_URL}/uploads/${img}`} className="w-full h-full object-cover" alt="Current" />
                        <button type="button" onClick={() => removeExistingImage(img)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-sm"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                    {newFiles.map((file, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-blue-200 bg-blue-50 shrink-0 shadow-sm">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-75" alt="New" />
                        <button type="button" onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-1 shadow-sm"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>

                  {(existingImages.length + newFiles.length) < 5 && (
                    <div className="border-2 border-dashed border-gray-100 rounded-xl p-6 bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer relative">
                      <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                      <Upload className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                      <p className="text-sm text-gray-500 font-medium">Add Photos</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-widest">Personality Description</Label>
                  <Textarea
                    name="description"
                    value={adoptableData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="bg-gray-50 border border-gray-100 rounded-md p-2 w-full text-sm outline-none focus:bg-white transition-all"
                    placeholder="Tell potential adopters more about this pet..."
                  />
                </div>
              </div>
            </form>

            {/* STICKY FOOTER: Gray background and rounded bottom */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
              <Button type="button" onClick={closeModal} variant="outline" className="cursor-pointer text-gray-500 font-medium px-4">
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="cursor-pointer bg-primary text-white font-semibold px-4 rounded-md shadow-md active:opacity-70 transition-all min-w-fit flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  isEditMode ? 'Save Changes' : 'Publish Adoptable'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 animate-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Delete Listing?</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-gray-900">"{adoptableToDelete?.name}"</span>?
                This will permanently delete the listing and all photos.
              </p>
              <div className="flex w-full gap-4">
                <Button variant="outline" className="flex-1 h-12 cursor-pointer font-bold text-gray-600 border-gray-100 hover:bg-gray-50" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button
                  disabled={isDeleting}
                  className="flex-1 h-12 cursor-pointer font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg active:scale-95 transition-all"
                  onClick={handleConfirmDelete}
                >
                  {isDeleting ? <Loader2 className="animate-spin h-5 w-5" /> : "Yes, Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};