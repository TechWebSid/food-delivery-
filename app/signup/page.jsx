"use client";

import { useState } from "react";
import { registerUser, googleAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleSignup = async () => {
    try {
      setLoading(true);
      await registerUser(
        form.name,
        form.email,
        form.password,
        form.role
      );
      form.role === "delivery"
        ? router.push("/waiting")
        : router.push("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await googleAuth();
      router.push("/");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm">
            Join Brotherhood Cafe
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Account Type</label>
            <select
              className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="user">Customer</option>
              <option value="delivery">Delivery Partner</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-gray-300 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          Continue with Google
        </button>

        <p className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-black font-medium hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}