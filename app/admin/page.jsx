"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

function AdminDashboardContent() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");

  /* ===============================
     FETCH USERS (REALTIME)
  ================================ */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(data);
      }
    );

    return () => unsubscribe();
  }, []);

  /* ===============================
     ACTIONS
  ================================ */
  const approveDelivery = async (id) => {
    await updateDoc(doc(db, "users", id), {
      approved: true,
    });
  };

  const toggleAvailability = async (id, current) => {
    await updateDoc(doc(db, "users", id), {
      isAvailable: !current,
    });
  };

  const changeRole = async (id, newRole) => {
    await updateDoc(doc(db, "users", id), {
      role: newRole,
      approved: newRole === "delivery" ? false : true,
    });
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  /* ===============================
     FILTER
  ================================ */
  const filteredUsers =
    filter === "all"
      ? users
      : users.filter((u) => u.role === filter);

  /* ===============================
     UI
  ================================ */
  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">
            Admin Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          {["all", "user", "delivery"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg border ${
                filter === type
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="p-4">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Approved</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t text-sm">
                  <td className="p-4 font-medium">
                    {user.name}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.role === "delivery"
                      ? user.approved
                        ? "Yes"
                        : "No"
                      : "-"}
                  </td>
                  <td>
                    {user.role === "delivery"
                      ? user.isAvailable
                        ? "Online"
                        : "Offline"
                      : "-"}
                  </td>
                  <td className="flex gap-2 py-3">

                    {user.role === "delivery" &&
                      !user.approved && (
                        <button
                          onClick={() =>
                            approveDelivery(user.id)
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                      )}

                    {user.role === "delivery" && (
                      <button
                        onClick={() =>
                          toggleAvailability(
                            user.id,
                            user.isAvailable
                          )
                        }
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Toggle
                      </button>
                    )}

                    <button
                      onClick={() =>
                        changeRole(
                          user.id,
                          user.role === "user"
                            ? "delivery"
                            : "user"
                        )
                      }
                      className="bg-gray-800 text-white px-3 py-1 rounded"
                    >
                      Switch Role
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No users found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ===============================
   WRAPPER WITH ROLE PROTECTION
================================ */
export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}