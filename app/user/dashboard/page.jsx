"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;

      const snap = await getDoc(
        doc(db, "users", auth.currentUser.uid)
      );

      if (snap.exists()) {
        setUserData(snap.data());
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-semibold">
              Welcome, {userData.name}
            </h1>
            <p className="text-gray-500">
              Manage your orders and profile
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-black text-white px-5 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-6">

          <div
            onClick={() => router.push("/user/menu")}
            className="bg-white p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">
              Browse Menu
            </h2>
            <p className="text-gray-500 text-sm">
              Explore our delicious dishes
            </p>
          </div>

          <div
            onClick={() => router.push("/user/orders")}
            className="bg-white p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">
              My Orders
            </h2>
            <p className="text-gray-500 text-sm">
              Track your previous orders
            </p>
          </div>

          <div
            onClick={() => router.push("/user/profile")}
            className="bg-white p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">
              My Address
            </h2>
            <p className="text-gray-500 text-sm">
              Manage delivery address
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}