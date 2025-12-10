import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Activity,
  HeartPulse,
  Stethoscope,
  Scissors,
} from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

/* ---------------------------------------------
   EXACT HEALTH STATE TYPE
--------------------------------------------- */

export default function PetProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Typed states
  const [pet, setPet] = useState(null);
  const [health, setHealth] = useState({
    vaccinations: [],
    medicalHistory: [],
    grooming: [],
    weightLogs: [],
    notes: "",
  });

  const [newVaccine, setNewVaccine] = useState("");
  const [newMedical, setNewMedical] = useState("");
  const [newGrooming, setNewGrooming] = useState("");
  const [newWeight, setNewWeight] = useState("");

  /* ---------------------------------------------
     Load Pet + Health Data
  --------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    const pets = JSON.parse(localStorage.getItem("pets") || "[]");
    const found = pets.find((p) => p.id === id);

    if (!found) {
      toast.error("Pet not found.");
      navigate("/mypets");
      return;
    }

    setPet(found);

    const healthData = JSON.parse(localStorage.getItem("petHealth") || "{}");

    if (healthData[id]) {
      setHealth({
        vaccinations: healthData[id].vaccinations || [],
        medicalHistory: healthData[id].medicalHistory || [],
        grooming: healthData[id].grooming || [],
        weightLogs: healthData[id].weightLogs || [],
        notes: healthData[id].notes || "",
      });
    }
  }, [id, navigate]);

  /* ---------------------------------------------
     Save Health Data (Typed)
  --------------------------------------------- */
  const saveHealthData = (updated) => {
    const allHealth = JSON.parse(
      localStorage.getItem("petHealth") || "{}"
    );

    if (!id) return;

    allHealth[id] = updated;

    localStorage.setItem("petHealth", JSON.stringify(allHealth));
    setHealth(updated);
  };

  /* ---------------------------------------------
     Add new health logs
  --------------------------------------------- */
  const addVaccination = () => {
    if (!newVaccine.trim()) return;
    saveHealthData({
      ...health,
      vaccinations: [...health.vaccinations, newVaccine.trim()],
    });
    setNewVaccine("");
    toast.success("Vaccination added.");
  };

  const addMedicalHistory = () => {
    if (!newMedical.trim()) return;
    saveHealthData({
      ...health,
      medicalHistory: [...health.medicalHistory, newMedical.trim()],
    });
    setNewMedical("");
    toast.success("Medical history entry added.");
  };

  const addGrooming = () => {
    if (!newGrooming.trim()) return;
    saveHealthData({
      ...health,
      grooming: [...health.grooming, newGrooming.trim()],
    });
    setNewGrooming("");
    toast.success("Grooming record added.");
  };

  const addWeightLog = () => {
    if (!newWeight.trim()) return;
    saveHealthData({
      ...health,
      weightLogs: [...health.weightLogs, newWeight.trim()],
    });
    setNewWeight("");
    toast.success("Weight log added.");
  };

  /* ---------------------------------------------
     Delete entry (Fully typed)
  --------------------------------------------- */
  const deleteEntry = (key, index) => {
    saveHealthData({
      ...health,
      [key]: health[key].filter((_, i) => i !== index),
    });
    toast.success("Entry removed.");
  };

  /* ---------------------------------------------
     Render
  --------------------------------------------- */

  if (!pet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" onClick={() => navigate("/mypets")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My Pets
      </Button>

      {/* Pet Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-40 h-40 rounded-xl overflow-hidden">
          <ImageWithFallback
            src={pet.images[0]}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h1 className="text-4xl mb-1">{pet.name}</h1>
          <p className="text-gray-600 mb-2">
            {pet.breed} • {pet.age} years • {pet.type}
          </p>

          <Badge variant="secondary">{pet.status}</Badge>
        </div>
      </div>

      {/* ----------------------------- */}
      {/* Vaccinations */}
      {/* ----------------------------- */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Vaccinations
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {health.vaccinations.length === 0 ? (
            <p className="text-sm text-gray-500">No vaccinations recorded.</p>
          ) : (
            <ul className="space-y-2">
              {health.vaccinations.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded-md"
                >
                  <span>{item}</span>
                  <Trash2
                    className="h-4 w-4 text-red-500 cursor-pointer"
                    onClick={() => deleteEntry("vaccinations", index)}
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <Input
              value={newVaccine}
              onChange={(e) => setNewVaccine(e.target.value)}
              placeholder="Add vaccination"
            />
            <Button onClick={addVaccination}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------- */}
      {/* Medical History */}
      {/* ----------------------------- */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Medical History
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {health.medicalHistory.length === 0 ? (
            <p>No medical history recorded.</p>
          ) : (
            <ul className="space-y-2">
              {health.medicalHistory.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded-md"
                >
                  <span>{item}</span>
                  <Trash2
                    className="h-4 w-4 text-red-500 cursor-pointer"
                    onClick={() => deleteEntry("medicalHistory", index)}
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <Input
              value={newMedical}
              onChange={(e) => setNewMedical(e.target.value)}
              placeholder="Add medical entry"
            />
            <Button onClick={addMedicalHistory}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------- */}
      {/* Grooming */}
      {/* ----------------------------- */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Grooming Records
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {health.grooming.length === 0 ? (
            <p>No grooming records yet.</p>
          ) : (
            <ul className="space-y-2">
              {health.grooming.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded-md"
                >
                  <span>{item}</span>
                  <Trash2
                    className="h-4 w-4 text-red-500 cursor-pointer"
                    onClick={() => deleteEntry("grooming", index)}
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <Input
              value={newGrooming}
              onChange={(e) => setNewGrooming(e.target.value)}
              placeholder="Add grooming entry"
            />
            <Button onClick={addGrooming}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------- */}
      {/* Weight Logs */}
      {/* ----------------------------- */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Weight Logs
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {health.weightLogs.length === 0 ? (
            <p>No weight logs yet.</p>
          ) : (
            <ul className="space-y-2">
              {health.weightLogs.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded-md"
                >
                  <span>{item}</span>
                  <Trash2
                    className="h-4 w-4 text-red-500 cursor-pointer"
                    onClick={() => deleteEntry("weightLogs", index)}
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <Input
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Add weight entry"
            />
            <Button onClick={addWeightLog}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------- */}
      {/* Notes */}
      {/* ----------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> General Notes
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Textarea
            rows={5}
            placeholder="Write notes about behavior, diet, changes, etc."
            value={health.notes}
            onChange={(e) =>
              saveHealthData({ ...health, notes: e.target.value })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
