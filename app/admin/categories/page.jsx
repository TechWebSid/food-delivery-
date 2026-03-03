"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // 🔥 Real-time fetch
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(data);
      }
    );

    return () => unsubscribe();
  }, []);

  // ➕ Add category
  const handleAdd = async () => {
    if (!newCategory.trim()) return;

    await addDoc(collection(db, "categories"), {
      name: newCategory,
      createdAt: serverTimestamp(),
    });

    setNewCategory("");
  };

  // ❌ Delete category
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "categories", id));
  };

  // ✏ Edit category
  const handleUpdate = async (id) => {
    if (!editingName.trim()) return;

    await updateDoc(doc(db, "categories", id), {
      name: editingName,
    });

    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-semibold mb-8">
          Category Management
        </h1>

        {/* Add Category */}
        <div className="bg-white p-6 rounded-xl shadow mb-8 flex gap-4">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={handleAdd}
            className="bg-black text-white px-6 rounded-lg hover:opacity-90"
          >
            Add
          </button>
        </div>

        {/* Category Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="p-4">Category Name</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t">

                  <td className="p-4">
                    {editingId === cat.id ? (
                      <input
                        value={editingName}
                        onChange={(e) =>
                          setEditingName(e.target.value)
                        }
                        className="border p-2 rounded w-full"
                      />
                    ) : (
                      cat.name
                    )}
                  </td>

                  <td className="text-sm text-gray-500">
                    {cat.createdAt?.toDate
                      ? cat.createdAt.toDate().toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="flex gap-2 py-3">

                    {editingId === cat.id ? (
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditingName(cat.name);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-gray-500">
                    No categories added yet.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}