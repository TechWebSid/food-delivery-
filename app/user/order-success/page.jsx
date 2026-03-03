"use client";

import { useRouter } from "next/navigation";

export default function OrderSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow text-center">
        <h1 className="text-3xl font-semibold mb-4">
          🎉 Order Successful
        </h1>
        <p className="text-gray-500 mb-6">
          Your order has been placed successfully.
        </p>
        <button
          onClick={() =>
            router.push("/user/dashboard")
          }
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}