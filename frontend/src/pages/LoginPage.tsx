import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { set } from "date-fns";
import toast from "react-hot-toast";
import { Loading } from "@/components/ui/loading";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { makeApiCall, fetching, fetchType } = useAPICall();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await makeApiCall(
      "POST",
      API_ENDPOINT.LOGIN,
      formData,
      "application/json",
      null,
      "login"
    );
    if (response.status == 200) {
      login(response.data.user, response.data.token);
      toast.success("Login successful!");
      navigate("/user/dashboard", { replace: true });
    } else {
      toast.error("Login failed! Please check your credentials.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email to reset password.");
      return;
    }
    const response = await makeApiCall(
      "post",
      API_ENDPOINT.FORGOT_PASSWORD,
      {
        email: formData.email,
      },
      "application/json",
      null,
      "forgotPassword"
    );
    if (response.status == 200) {
      toast.success("Reset link has been sent to your email");
    } else {
      toast.error("User with this email not exist");
    }
  };
  return (
    <div className="container px-4 max-w-md mx-auto py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span></span>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline flex items-center cursor-pointer"
                disabled={fetching}
                onClick={handleForgotPassword}
              >
                Forgot Password?
                {fetching && fetchType == "forgotPassword" && (
                  <div className="pl-2 flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
              </button>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={fetching}
              loading={fetching && fetchType == "login"}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
