"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function UserMenuPage() {
  const router = useRouter();

  const { addToCart, totalItems } = useCart(); // ✅ Hook inside component

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");

  // Fetch categories
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCategories(data);
      if (data.length > 0) setActiveCategory(data[0].id);
    });

    return () => unsub();
  }, []);

  // Fetch products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  const filteredProducts = products.filter(
    (p) => p.categoryId === activeCategory
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm p-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold">
            Explore Our Menu
          </h1>
          <p className="text-gray-500 text-sm">
            Fresh & Delicious Everyday
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* Category Tabs */}
        <div className="flex gap-4 overflow-x-auto mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? "bg-black text-white"
                  : "bg-white border"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-3 gap-8">

          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden flex flex-col"
            >

              {/* Image */}
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  className="h-52 w-full object-cover"
                />
              ) : (
                <div className="h-52 bg-gray-200 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">

                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">
                    {product.name}
                  </h2>

                  {!product.isAvailable && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      Not Available
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 flex-1">
                  {product.description}
                </p>

                <div className="mt-4 flex justify-between items-center">
                  <span className="font-bold text-lg">
                    ₹ {product.price}
                  </span>

                  {product.isAvailable ? (
                    <button
                      onClick={() => addToCart(product)} // ✅ Global cart
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
                    >
                      Add
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm"
                    >
                      Unavailable
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-3 text-center text-gray-500">
              No items in this category.
            </div>
          )}

        </div>

      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => router.push("/user/cart")}
            className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition"
          >
            🛒 {totalItems} Items
          </button>
        </div>
      )}

    </div>
  );
}