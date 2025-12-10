import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
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
import { Eye, EyeOff, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(import.meta.env.VITE_BASE_URL + "/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.msg || "Login failed");
        return;
      }

      loginWithToken(result.token, result.user);

      toast.success("Logged in successfully!");
      navigate("/home");

    } catch (err) {
      toast.error("Cannot connect to server. Please try again.");
      console.error("Network error:", err);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = import.meta.env.VITE_BASE_URL + "/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Login to your PetConnect account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  className={
                    errors.password ? "border-red-500 pr-10" : "pr-10"
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Login
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
            >
              <Mail className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>

            {/* Register Redirect */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-purple-600 hover:underline"
              >
                Sign up
              </button>
            </p>

            {/* Forgot Password */}
            <p className="text-center text-sm text-gray-600">
              <button
                type="button"
                onClick={() => navigate("/forgotpassword")}
                className="text-purple-600 hover:underline"
              >
                Forgot your password?
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};