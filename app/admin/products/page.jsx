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

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch Categories
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsub();
  }, []);

  // 🔥 Fetch Products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsub();
  }, []);

  // ➕ Add Product
  const handleAdd = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      alert("Name, price and category required");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "products"), {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        categoryId: form.categoryId,
        imageUrl: form.imageUrl || "", // optional
        isAvailable: true,
        createdAt: serverTimestamp(),
      });

      setForm({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        imageUrl: "",
      });

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "products", id));
  };

  // 🔄 Toggle Availability
  const toggleAvailability = async (id, current) => {
    await updateDoc(doc(db, "products", id), {
      isAvailable: !current,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-semibold mb-8">
          Product Management
        </h1>

        {/* Add Product Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-10 space-y-4">

          <div className="grid grid-cols-2 gap-4">

            <input
              placeholder="Product Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="border p-3 rounded-lg"
            />

            <input
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              className="border p-3 rounded-lg"
            />

            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
              className="border p-3 rounded-lg"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Image URL (optional)"
              value={form.imageUrl}
              onChange={(e) =>
                setForm({ ...form, imageUrl: e.target.value })
              }
              className="border p-3 rounded-lg"
            />

          </div>

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="border p-3 rounded-lg w-full"
          />

          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="p-4">Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} className="border-t">

                  <td className="p-4">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded">
                        No Image
                      </div>
                    )}
                  </td>

                  <td>{prod.name}</td>
                  <td>₹ {prod.price}</td>
                  <td>
                    {
                      categories.find(
                        (c) => c.id === prod.categoryId
                      )?.name
                    }
                  </td>
                  <td>
                    {prod.isAvailable ? "Yes" : "No"}
                  </td>

                  <td className="flex gap-2 py-3">
                    <button
                      onClick={() =>
                        toggleAvailability(
                          prod.id,
                          prod.isAvailable
                        )
                      }
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Toggle
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(prod.id)
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No products added yet.
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