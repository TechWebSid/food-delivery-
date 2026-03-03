"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import dynamic from "next/dynamic";

const TrackingMap = dynamic(
  () => import("@/components/TrackingMap"),
  { ssr: false }
);

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
     WAIT FOR AUTH PROPERLY
  ================================ */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  /* ===============================
     FETCH USER ORDERS (NO INDEX)
  ================================ */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      let data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // 🔥 MANUAL SORT (Latest First)
      data.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return (
          b.createdAt.seconds - a.createdAt.seconds
        );
      });

      setOrders(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-semibold mb-8">
          My Orders
        </h1>

        {orders.length === 0 && (
          <div>No orders found.</div>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-6 rounded-xl shadow mb-8"
          >
            {/* HEADER */}
            <div className="flex justify-between mb-4">
              <span className="text-sm text-gray-500">
                Order ID: {order.id}
              </span>

              <span className="capitalize font-medium">
                {order.status?.replaceAll("_", " ")}
              </span>
            </div>

            {/* ITEMS */}
            <div className="space-y-1">
              {order.items?.map((item, i) => (
                <div key={i}>
                  {item.name} x {item.quantity}
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="mt-3 font-semibold">
              Total: ₹ {order.totalAmount}
            </div>

            {/* LIVE TRACKING */}
            {order.status === "out_for_delivery" &&
              order.deliveryLocation?.lat &&
              order.deliveryDetails?.lat && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">
                    Live Tracking
                  </h3>

                  <TrackingMap
                    userLat={order.deliveryDetails.lat}
                    userLng={order.deliveryDetails.lng}
                    deliveryLat={order.deliveryLocation.lat}
                    deliveryLng={order.deliveryLocation.lng}
                  />
                </div>
              )}
          </div>
        ))}

      </div>
    </div>
  );
}