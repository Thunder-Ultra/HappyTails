import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { User, Mail, Briefcase, Home, Clock, PawPrint, MapPin, Baby, Fence, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);

  // Expanded form state to match all DB columns
  const [formData, setFormData] = useState({
    name: "",
    // Address Table
    house_no: "",
    street: "",
    landmark: "",
    pincode: "",
    town_city: "",
    state: "",
    // UserProfiles Table
    occupation: "",
    daily_hours_away: 0,
    housing_type: "House",
    ownership_status: "Owned",
    has_fenced_yard: "No",
    has_kids: "No",
    experience_level: "First Time",
    other_pet_details: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile");

        const u = data.user;
        setUser(u);

        // Map joined DB data to flat form state
        setFormData({
          name: u.name || "",
          house_no: u.house_no || "",
          street: u.street || "",
          landmark: u.landmark || "",
          pincode: u.pincode || "",
          town_city: u.town_city || "",
          state: u.state || "",
          occupation: u.occupation || "",
          daily_hours_away: u.daily_hours_away || 0,
          housing_type: u.housing_type || "House",
          ownership_status: u.ownership_status || "Owned",
          has_fenced_yard: u.has_fenced_yard || "No",
          has_kids: u.has_kids || "No",
          experience_level: u.experience_level || "First Time",
          other_pet_details: u.other_pet_details || "",
        });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, navigate]);

  const saveChanges = async () => {
    try {
      // Structure the payload exactly as the backend expects
      const payload = {
        name: formData.name,
        address: {
          house_no: formData.house_no,
          street: formData.street,
          landmark: formData.landmark,
          pincode: formData.pincode,
          town_city: formData.town_city,
          state: formData.state,
        },
        profile: {
          occupation: formData.occupation,
          daily_hours_away: parseInt(formData.daily_hours_away),
          housing_type: formData.housing_type,
          ownership_status: formData.ownership_status,
          has_fenced_yard: formData.has_fenced_yard,
          has_kids: formData.has_kids,
          experience_level: formData.experience_level,
          other_pet_details: formData.other_pet_details,
        },
      };

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Update failed");

      setUser(data.user);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading profile...</p>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">My Profile</h1>
          <p className="text-gray-500">View and manage your adoption eligibility</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT COLUMN: BASIC INFO */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-gray-400 uppercase">Full Name</Label>
                {isEditing ? (
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                ) : (
                  <p className="font-bold">{user.name}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400 uppercase">Email</Label>
                <p className="text-sm text-gray-600 flex items-center gap-2"><Mail className="h-3 w-3" /> {user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    placeholder="House No / Flat"
                    value={formData.house_no}
                    onChange={(e) => setFormData({ ...formData, house_no: e.target.value })}
                  />
                  <Input
                    placeholder="Street / Area"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  />
                  <Input
                    placeholder="Town / City"
                    value={formData.town_city}
                    onChange={(e) => setFormData({ ...formData, town_city: e.target.value })}
                  />
                  <Input
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                  <Input
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              ) : (
                <div className="text-sm space-y-1 text-gray-600">
                  {/* Check if at least one part of the address exists */}
                  {user.town_city || user.street ? (
                    <>
                      <p className="font-medium text-black">
                        {user.house_no} {user.street}
                      </p>
                      <p>
                        {user.town_city}{user.town_city && user.state ? ", " : ""}{user.state}
                      </p>
                      <p className="font-mono text-xs">{user.pincode}</p>
                    </>
                  ) : (
                    <p className="text-gray-400 italic">No address provided yet.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: ADOPTION PROFILE */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-500" />
                Adoption Requirements
              </CardTitle>
              <CardDescription>This information helps Caretakers know about you, without you sending them individually multiple times</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Occupation</Label>
                  {isEditing ? (
                    <Input value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} />
                  ) : (
                    <p className="text-sm">{user.occupation || "N/A"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> Hours Away Daily</Label>
                  {isEditing ? (
                    <Input type="number" value={formData.daily_hours_away} onChange={(e) => setFormData({ ...formData, daily_hours_away: e.target.value })} />
                  ) : (
                    <p className="text-sm">{user.daily_hours_away} Hours</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Home className="h-4 w-4" /> Housing Type</Label>
                  {isEditing ? (
                    <Select value={formData.housing_type} onValueChange={(v) => setFormData({ ...formData, housing_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Apartment', 'House', 'Villa', 'Farm'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{user.housing_type}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Fence className="h-4 w-4" /> Fenced Yard?</Label>
                  {isEditing ? (
                    <Select value={formData.has_fenced_yard} onValueChange={(v) => setFormData({ ...formData, has_fenced_yard: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{user.has_fenced_yard}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Baby className="h-4 w-4" /> Have Kids?</Label>
                  {isEditing ? (
                    <Select value={formData.has_kids} onValueChange={(v) => setFormData({ ...formData, has_kids: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{user.has_kids}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><PawPrint className="h-4 w-4" /> Experience</Label>
                  {isEditing ? (
                    <Select value={formData.experience_level} onValueChange={(v) => setFormData({ ...formData, experience_level: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['First Time', 'Had Pets Before', 'Experienced'].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{user.experience_level}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Pet Details / History</Label>
                {isEditing ? (
                  <Textarea value={formData.other_pet_details} onChange={(e) => setFormData({ ...formData, other_pet_details: e.target.value })} placeholder="Tell us about your previous or current pets..." />
                ) : (
                  <p className="text-sm text-gray-600">{user.other_pet_details || "No details provided"}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-6 border-t">
                  <Button className="flex-1" onClick={saveChanges}>Save All Changes</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}