import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { User, Mail, Briefcase, Home, Clock, PawPrint } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    occupation: user?.occupation || '',
    address: user?.address || '',
    availableTime: user?.availableTime || '',
    pastExperience: user?.pastExperience || ''
  });

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details and preferences</CardDescription>
            </div>
            <Badge variant={user.role === 'parent' ? 'default' : 'secondary'}>
              {user.role === 'parent' ? 'Pet Parent' : 'Adopter'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info - Always Visible */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <Label>Full Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <p>{user.name}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <Label>Email</Label>
                <p>{user.email}</p>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Additional Info for Adopters */}
          {user.role === 'adopter' && (
            <>
              <div className="border-t pt-6">
                <h3 className="text-lg mb-4">Adopter Profile</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <Label>Occupation</Label>
                      {isEditing ? (
                        <Input
                          value={formData.occupation}
                          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                          placeholder="Your occupation"
                        />
                      ) : (
                        <p>{user.occupation || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <Label>Home Address</Label>
                      {isEditing ? (
                        <Input
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Your address"
                        />
                      ) : (
                        <p>{user.address || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <Label>Available Time for Pet Care</Label>
                      {isEditing ? (
                        <Input
                          value={formData.availableTime}
                          onChange={(e) => setFormData({ ...formData, availableTime: e.target.value })}
                          placeholder="e.g., 4-6 hours daily"
                        />
                      ) : (
                        <p>{user.availableTime || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <PawPrint className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <Label>Past Pet Experience</Label>
                      {isEditing ? (
                        <Textarea
                          value={formData.pastExperience}
                          onChange={(e) => setFormData({ ...formData, pastExperience: e.target.value })}
                          placeholder="Tell us about your experience with pets..."
                          rows={3}
                        />
                      ) : (
                        <p>{user.pastExperience || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 Complete your profile to increase your chances of successful adoption. 
                  Pet parents want to know about your experience and living situation.
                </p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      occupation: user.occupation || '',
                      address: user.address || '',
                      availableTime: user.availableTime || '',
                      pastExperience: user.pastExperience || ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="flex-1">
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Account Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{user.role === 'parent' ? 'Pet Parent' : 'Adopter'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Member Since</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">2024</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
