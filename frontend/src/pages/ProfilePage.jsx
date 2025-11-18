import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { User, Mail, Briefcase, Home, Clock, PawPrint } from 'lucide-react';
import { toast } from 'sonner';

import React from 'react';

export default function ProfilePage({ onNavigate }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information (placeholder)</p>
        <div className="mt-6">
          <button className="px-4 py-2 bg-primary text-white rounded" onClick={() => onNavigate('home')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

