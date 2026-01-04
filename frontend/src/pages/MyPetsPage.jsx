import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { formatDate, formatDateForInput } from "../utils/formatters";

// UI Components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Eye, Plus, X, Upload, Pencil, Trash2, AlertTriangle, Stethoscope } from "lucide-react";

export default function MyPetsPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [myPets, setMyPets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPetId, setEditingPetId] = useState(null);

  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableBreeds, setAvailableBreeds] = useState([]);

  // Updated Form State with all DB fields
  const [formData, setFormData] = useState({
    name: "",
    gender: "Male",
    dob: "",
    type_id: "",
    breed_id: "",
    vaccinated: "Unknown",
    last_vaccine_date: "",
    de_wormed: "Unknown",
    sterilized: "No",
    image: null,
  });

  useEffect(() => {
    if (user && token) {
      loadMyPets();
      loadPetTypes();
    }
  }, [user, token]);

  useEffect(() => {
    if (formData.type_id) {
      loadBreeds(formData.type_id);
    } else {
      setAvailableBreeds([]);
    }
  }, [formData.type_id]);

  const loadPetTypes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/public/pet-types`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTypes(data);
      }
    } catch (err) {
      console.error("Failed to load pet types", err);
    }
  };

  const loadBreeds = async (typeId) => {
    try {
      const response = await fetch(`${BASE_URL}/public/pet-breeds?typeId=${typeId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableBreeds(data);
      }
    } catch (err) {
      console.error("Failed to load breeds", err);
    }
  };

  const loadMyPets = async () => {
    try {
      const response = await fetch(`${BASE_URL}/pets/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMyPets(data);
      }
    } catch (err) {
      console.error("Failed to load pets", err);
    }
  };

  const handleEditClick = (pet) => {
    setIsEditMode(true);
    setEditingPetId(pet.id);
    setFormData({
      ...pet,
      dob: formatDateForInput(pet.dob),
      last_vaccine_date: formatDateForInput(pet.last_vaccine_date),
      image: null,
    });
    setIsModalOpen(true);
  };

  const openDeleteDialog = (pet) => {
    setPetToDelete(pet);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!petToDelete) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/pets/${petToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success(`${petToDelete.name} has been removed.`);
        loadMyPets();
        setIsDeleteDialogOpen(false);
      } else {
        throw new Error("Failed to delete pet");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setPetToDelete(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "type_id") {
      setFormData(prev => ({ ...prev, type_id: value, breed_id: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File is too large! Please select an image under 5MB.");
      e.target.value = "";
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingPetId(null);
    setFormData({
      name: "", gender: "Male", dob: "", type_id: "", breed_id: "",
      vaccinated: "Unknown", last_vaccine_date: "", de_wormed: "Unknown", sterilized: "No", image: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'image') {
          // Send empty string if date is null to avoid backend errors
          const value = (key === 'dob' || key === 'last_vaccine_date') && !formData[key] ? "" : formData[key];
          dataToSend.append(key, value);
        }
      });

      if (formData.image) {
        dataToSend.append("pet_pic_name", formData.image);
      }

      const url = isEditMode ? `${BASE_URL}/pets/${editingPetId}` : `${BASE_URL}/pets/`;
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });

      if (!response.ok) throw new Error(`Failed to ${isEditMode ? 'update' : 'add'} pet`);

      toast.success(`Pet ${isEditMode ? 'updated' : 'added'} successfully!`);
      closeModal();
      loadMyPets();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl mb-2 font-bold text-gray-800">My Pets</h1>
          <p className="text-gray-600">Manage your private pets and health records</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" /> Add Pet
        </Button>
      </div>

      {myPets.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Upload className="h-10 w-10 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No pets added yet</h2>
          <Button onClick={() => setIsModalOpen(true)} className="cursor-pointer">Add Your First Pet</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myPets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative aspect-square bg-gray-100">
                <ImageWithFallback
                  src={pet.pet_pic_name ? `${BASE_URL}/uploads/${pet.pet_pic_name}` : null}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8 cursor-pointer" onClick={() => handleEditClick(pet)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8 cursor-pointer" onClick={() => openDeleteDialog(pet)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="pt-4">
                <h3 className="text-lg font-bold">{pet.name}</h3>
                <p className="text-sm text-gray-600">{pet.breed_name || "Unknown Breed"}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="secondary" className="text-[10px]">{pet.gender}</Badge>
                  {pet.vaccinated === 'Yes' && <Badge className="text-[10px] bg-green-100 text-green-700">Vaccinated</Badge>}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full cursor-pointer" variant="outline" onClick={() => navigate(`/petprofile/${pet.id}`)}>
                  <Eye className="h-4 w-4 mr-2" /> Health Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* --- ADD/EDIT PET MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10 rounded-t-xl">
              <h2 className="text-2xl font-bold">{isEditMode ? "Edit Pet Details" : "Add New Pet"}</h2>
              <button onClick={closeModal} className="cursor-pointer hover:text-red-500 transition-colors"><X className="h-6 w-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* SECTION: BASIC INFO */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-600">
                  <Plus className="h-5 w-5" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pet Name *</label>
                    <input type="text" name="name" required className="w-full p-2 border rounded-md" placeholder="Eg: Tommy" value={formData.name} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender *</label>
                    <select name="gender" className="w-full p-2 border rounded-md" value={formData.gender} onChange={handleInputChange}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date of Birth</label>
                    <input type="date" name="dob" className="w-full p-2 border rounded-md" value={formData.dob} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pet Type *</label>
                    <select name="type_id" required className="w-full p-2 border rounded-md" value={formData.type_id} onChange={handleInputChange}>
                      <option value="">Select Type</option>
                      {availableTypes.map(t => (<option key={t.id} value={t.id.toString()}>{t.name}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Breed</label>
                    <select name="breed_id" className="w-full p-2 border rounded-md" value={formData.breed_id} onChange={handleInputChange} disabled={!formData.type_id}>
                      <option value="">Select Breed</option>
                      {availableBreeds.map(b => (<option key={b.id} value={b.id.toString()}>{b.name}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{isEditMode ? "Change Picture" : "Profile Picture"}</label>
                    <input type="file" accept="image/*" className="w-full p-1 border rounded-md text-sm" onChange={handleFileChange} />
                  </div>
                </div>
              </div>

              {/* SECTION: MEDICAL DETAILS */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
                  <Stethoscope className="h-5 w-5" /> Medical & Health
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sterilized? (Spayed/Neutered)</label>
                    <select name="sterilized" className="w-full p-2 border rounded-md" value={formData.sterilized} onChange={handleInputChange}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">De-wormed?</label>
                    <select name="de_wormed" className="w-full p-2 border rounded-md" value={formData.de_wormed} onChange={handleInputChange}>
                      <option value="Unknown">Unknown</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vaccination Status</label>
                    <select name="vaccinated" className="w-full p-2 border rounded-md" value={formData.vaccinated} onChange={handleInputChange}>
                      <option value="Unknown">Unknown</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Partially">Partially</option>
                    </select>
                  </div>

                  {/* Conditional Field: Only show date if pet has some vaccination */}
                  {(formData.vaccinated === 'Yes' || formData.vaccinated === 'Partially') && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-medium">Last Vaccination Date</label>
                      <input type="date" name="last_vaccine_date" className="w-full p-2 border rounded-md border-blue-200 bg-blue-50/30" value={formData.last_vaccine_date} onChange={handleInputChange} />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t">
                <Button type="button" variant="outline" onClick={closeModal} className="cursor-pointer">Cancel</Button>
                <Button type="submit" tdisabled={loading} cclassName="cursor-pointer !bg-blue-600 hover:!bg-blue-700 !text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50">
                  {loading ? "Saving..." : isEditMode ? "Update Pet" : "Add Pet"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Pet?</h2>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-bold text-gray-800">"{petToDelete?.name}"</span>?
                This will remove all their health records and cannot be undone.
              </p>

              <div className="flex w-full gap-3">
                <Button
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 cursor-pointer"
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Yes, Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}