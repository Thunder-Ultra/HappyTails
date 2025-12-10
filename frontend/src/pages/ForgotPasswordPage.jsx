import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, KeyRound, Mail, Lock } from "lucide-react";

// Define the steps for the flow
const STEPS = {
  EMAIL: 1,
  OTP: 2,
  NEW_PASSWORD: 3,
};

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // State Management
  const [step, setStep] = useState(STEPS.EMAIL);
  const [isLoading, setIsLoading] = useState(false);

  // Form Data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });

  // --- API HANDLERS ---

  // 1. Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email");

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to send OTP");

      toast.success("OTP sent to your email!");
      setStep(STEPS.OTP);
    } catch (error) {
      console.error(error);
      toast.error("There is an issue! Please Try again Later!")
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Validate OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return toast.error("Please enter the OTP");

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Invalid OTP");

      toast.success("OTP Verified!");
      setStep(STEPS.NEW_PASSWORD);
    } catch (error) {
      console.error(error);
      toast.error("Couldn't Verify the OTP! Please Try again Later!")
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwords.new || !passwords.confirm) {
      return toast.error("Please fill in all fields");
    }
    if (passwords.new !== passwords.confirm) {
      return toast.error("Passwords do not match");
    }
    if (passwords.new.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword: passwords.new
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to reset password");

      toast.success("Password reset successfully! Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Failed to set New Password! Please Try again later!")
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderEmailStep = () => (
    <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          {/* Changed top-2.5 to top-1/2 -translate-y-1/2 */}
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send OTP"}
      </Button>
    </form>
  );

  const renderOtpStep = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <Label htmlFor="otp">Enter OTP</Label>
        <div className="relative">
          {/* Changed top-2.5 to top-1/2 -translate-y-1/2 */}
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="otp"
            type="text"
            placeholder="Enter 6-digit code"
            className="pl-10 tracking-widest"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isLoading}
            maxLength={6}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          We sent a code to <span className="font-semibold">{email}</span>
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify OTP"}
      </Button>
      <div className="text-center">
        <button
          type="button"
          onClick={() => setStep(STEPS.EMAIL)}
          className="text-sm text-gray-500 hover:text-gray-800 hover:underline"
        >
          Change Email
        </button>
      </div>
    </form>
  );

  const renderNewPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <Label htmlFor="new-pass">New Password</Label>
        <div className="relative">
          {/* Changed top-2.5 to top-1/2 -translate-y-1/2 */}
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="new-pass"
            type="password"
            placeholder="Enter new password"
            className="pl-10"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-pass">Confirm Password</Label>
        <div className="relative">
          {/* Changed top-2.5 to top-1/2 -translate-y-1/2 */}
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="confirm-pass"
            type="password"
            placeholder="Confirm new password"
            className="pl-10"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-purple-600">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">
            {step === STEPS.EMAIL && "Forgot Password"}
            {step === STEPS.OTP && "Verify OTP"}
            {step === STEPS.NEW_PASSWORD && "Reset Password"}
          </CardTitle>
          <CardDescription>
            {step === STEPS.EMAIL && "Enter your email to receive a reset code"}
            {step === STEPS.OTP && "Check your email for the verification code"}
            {step === STEPS.NEW_PASSWORD && "Create a strong new password"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === STEPS.EMAIL && renderEmailStep()}
          {step === STEPS.OTP && renderOtpStep()}
          {step === STEPS.NEW_PASSWORD && renderNewPasswordStep()}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center text-sm text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};