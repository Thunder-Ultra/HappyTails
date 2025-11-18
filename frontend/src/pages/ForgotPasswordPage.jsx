import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

import React from 'react';

export default function ForgotPasswordPage({ onNavigate }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>
        <p className="text-gray-600 mb-4">If you have an account, we'll send a reset link to your email.</p>
        <button
          className="px-4 py-2 bg-primary text-white rounded"
          onClick={() => onNavigate('login')}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

