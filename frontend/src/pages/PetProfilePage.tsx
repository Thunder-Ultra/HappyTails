import React, { useState, useEffect } from 'react';
import { Pet, HealthRecord } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PetProfilePageProps {
  petId: string;
  onNavigate: (page: string) => void;
}

export const PetProfilePage: React.FC<PetProfilePageProps> = ({ petId, onNavigate }) => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    height: 0,
    notes: ''
  });

  useEffect(() => {
    loadPetProfile();
    loadHealthRecords();
  }, [petId]);

  const loadPetProfile = () => {
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    const foundPet = pets.find((p: Pet) => p.id === petId);
    if (foundPet) {
      setPet(foundPet);
      setRecordForm(prev => ({
        ...prev,
        weight: foundPet.weight,
        height: foundPet.height
      }));
    }
  };

  const loadHealthRecords = () => {
    const records = JSON.parse(localStorage.getItem('healthRecords') || '[]');
    const petRecords = records.filter((r: HealthRecord) => r.petId === petId);
    setHealthRecords(petRecords.sort((a: HealthRecord, b: HealthRecord) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
  };

  const handleAddRecord = () => {
    if (!pet) return;

    if (recordForm.weight <= 0 || recordForm.height <= 0) {
      toast.error('Please enter valid weight and height');
      return;
    }

    const records = JSON.parse(localStorage.getItem('healthRecords') || '[]');
    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      petId: pet.id,
      date: recordForm.date,
      weight: recordForm.weight,
      height: recordForm.height,
      notes: recordForm.notes
    };

    records.push(newRecord);
    localStorage.setItem('healthRecords', JSON.stringify(records));

    // Update pet's current weight and height
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    const petIndex = pets.findIndex((p: Pet) => p.id === pet.id);
    if (petIndex !== -1) {
      pets[petIndex].weight = recordForm.weight;
      pets[petIndex].height = recordForm.height;
      localStorage.setItem('pets', JSON.stringify(pets));
    }

    loadHealthRecords();
    loadPetProfile();
    setAddRecordOpen(false);
    setRecordForm({
      date: new Date().toISOString().split('T')[0],
      weight: recordForm.weight,
      height: recordForm.height,
      notes: ''
    });
    toast.success('Health record added successfully!');
  };

  const chartData = healthRecords.map(record => ({
    date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: record.weight,
    height: record.height
  }));

  const getWeightTrend = () => {
    if (healthRecords.length < 2) return null;
    const latest = healthRecords[healthRecords.length - 1];
    const previous = healthRecords[healthRecords.length - 2];
    const diff = latest.weight - previous.weight;
    return diff;
  };

  const getHeightTrend = () => {
    if (healthRecords.length < 2) return null;
    const latest = healthRecords[healthRecords.length - 1];
    const previous = healthRecords[healthRecords.length - 2];
    const diff = latest.height - previous.height;
    return diff;
  };

  const weightTrend = getWeightTrend();
  const heightTrend = getHeightTrend();

  if (!pet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Pet not found</p>
        <Button onClick={() => onNavigate('mypets')}>Back to My Pets</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => onNavigate('mypets')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My Pets
      </Button>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Pet Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="aspect-square rounded-lg overflow-hidden mb-4">
              <ImageWithFallback
                src={pet.images[0]}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl mb-1">{pet.name}</h2>
            <p className="text-gray-600 mb-4">{pet.breed}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span>{pet.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span>{pet.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={pet.status === 'adopted' ? 'default' : 'outline'}>
                  {pet.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vaccinated:</span>
                <span>{pet.vaccinated ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Stats */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl">Health Profile</h2>
            <Button onClick={() => setAddRecordOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Current Weight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl">{pet.weight}</p>
                    <p className="text-sm text-gray-500">kg</p>
                  </div>
                  {weightTrend !== null && (
                    <div className={`flex items-center ${weightTrend > 0 ? 'text-green-600' : weightTrend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {weightTrend > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : weightTrend < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : <Activity className="h-4 w-4 mr-1" />}
                      <span className="text-sm">{Math.abs(weightTrend).toFixed(1)} kg</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Current Height</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl">{pet.height}</p>
                    <p className="text-sm text-gray-500">cm</p>
                  </div>
                  {heightTrend !== null && (
                    <div className={`flex items-center ${heightTrend > 0 ? 'text-green-600' : heightTrend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {heightTrend > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : heightTrend < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : <Activity className="h-4 w-4 mr-1" />}
                      <span className="text-sm">{Math.abs(heightTrend).toFixed(1)} cm</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Health Chart */}
      {chartData.length > 0 ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Health Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Height (cm)', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={2} name="Weight (kg)" />
                  <Line yAxisId="right" type="monotone" dataKey="height" stroke="#ec4899" strokeWidth={2} name="Height (cm)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No health records yet</p>
            <Button onClick={() => setAddRecordOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Record
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Health Records List */}
      {healthRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Health Records History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthRecords.slice().reverse().map(record => (
                <div key={record.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <span className="text-sm text-gray-600">Weight: </span>
                      <span>{record.weight} kg</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Height: </span>
                      <span>{record.height} cm</span>
                    </div>
                  </div>
                  {record.notes && (
                    <p className="text-sm text-gray-700">{record.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Record Dialog */}
      <Dialog open={addRecordOpen} onOpenChange={setAddRecordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Health Record</DialogTitle>
            <DialogDescription>
              Record {pet.name}'s current health metrics
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={recordForm.date}
                onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={recordForm.weight}
                  onChange={(e) => setRecordForm({ ...recordForm, weight: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={recordForm.height}
                  onChange={(e) => setRecordForm({ ...recordForm, height: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={recordForm.notes}
                onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                placeholder="Any observations or notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleAddRecord}>
                Add Record
              </Button>
              <Button variant="outline" onClick={() => setAddRecordOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
