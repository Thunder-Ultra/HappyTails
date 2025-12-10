import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { User, Mail, Briefcase, Home, Clock, PawPrint } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    occupation: "",
    address: "",
    availableTime: "",
    pastExperience: "",
  });

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load profile");

        setUser(data.user);

        setFormData({
          name: data.user.name || "",
          occupation: data.user.occupation || "",
          address: data.user.address || "",
          availableTime: data.user.availableTime || "",
          pastExperience: data.user.pastExperience || "",
        });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, navigate, firstLoad]);

  const saveChanges = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/users/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Update failed");
        return;
      }

      if (data.user) {
        setUser(data.user);

        setFormData({
          name: data.user.name || "",
          occupation: data.user.occupation || "",
          address: data.user.address || "",
          availableTime: data.user.availableTime || "",
          pastExperience: data.user.pastExperience || "",
        });
      }

      toast.success("Profile updated!");
      setIsEditing(false);

    } catch (err) {
      console.log(err)
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return <p className="p-6">Loading profile...</p>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Unable to load profile. Please log in.</p>
        <Button className="mt-4" onClick={() => navigate("/login")}>
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl mb-2">My Profile</h1>
      <p className="text-gray-600 mb-6">Manage your account information</p>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* FULL NAME */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400 mt-1" />
            <div className="flex-1">
              <Label>Full Name</Label>

              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm text-gray-600">{user.name}</p>
              )}
            </div>
          </div>

          {/* EMAIL */}
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-gray-400 mt-1" />
            <div className="flex-1">
              <Label>Email</Label>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
          </div>

          {/* ADOPTER FIELDS */}
          {user.role === "adopter" && (
            <div className="border-t pt-6 space-y-4">
              {/* Occupation */}
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <Label>Occupation</Label>
                  {isEditing ? (
                    <Input
                      value={formData.occupation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          occupation: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p>{user.occupation || "Not provided"}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <Home className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <Label>Address</Label>
                  {isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p>{user.address || "Not provided"}</p>
                  )}
                </div>
              </div>

              {/* Available Time */}
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <Label>Available Time</Label>
                  {isEditing ? (
                    <Input
                      value={formData.availableTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availableTime: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p>{user.availableTime || "Not provided"}</p>
                  )}
                </div>
              </div>

              {/* Past Experience */}
              <div className="flex items-start gap-3">
                <PawPrint className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <Label>Past Experience</Label>
                  {isEditing ? (
                    <Textarea
                      rows={3}
                      value={formData.pastExperience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pastExperience: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p>{user.pastExperience || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>
          )
          }

          {/* ACTION BUTTONS */}
          <div className="flex gap-2 pt-4">
            {isEditing ? (
              <>
                <Button className="flex-1" onClick={saveChanges}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button className="flex-1" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}