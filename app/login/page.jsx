"use client";

import { useState } from "react";
import { loginUser, googleAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      const user = await loginUser(email, password);

      if (user.role === "admin") router.push("/admin");
      else if (user.role === "delivery")
        user.approved ? router.push("/delivery") : router.push("/waiting");
      else router.push("/user/dashboard");
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
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm">
            Login to continue
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-gray-300 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          Continue with Google
        </button>

        <p className="text-sm text-center text-gray-500">
          Don’t have an account?{" "}
          <a href="/signup" className="text-black font-medium hover:underline">
            Signup
          </a>
        </p>
      </div>
    </div>
  );
}