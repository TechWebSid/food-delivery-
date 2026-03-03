"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import dynamic from "next/dynamic";

const TrackingMap = dynamic(
  () => import("@/components/TrackingMap"),
  { ssr: false }
);

export default function DeliveryPage() {
  const [orders, setOrders] = useState([]);

  /* ===============================
     FETCH ACTIVE ASSIGNED ORDERS
  ================================ */
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "orders"),
      where("assignedTo", "==", auth.currentUser.uid),
      where("status", "==", "out_for_delivery")
    );

    const unsub = onSnapshot(q, (snap) => {
      const active = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setOrders(active);
    });

    return () => unsub();
  }, []);

  /* ===============================
     LIVE LOCATION TRACKING
  ================================ */
  useEffect(() => {
    if (!auth.currentUser || orders.length === 0) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        for (const order of orders) {
          await updateDoc(doc(db, "orders", order.id), {
            deliveryLocation: { lat, lng },
          });
        }
      },
      () => {},
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [orders]);

  const markDelivered = async (id) => {
    await updateDoc(doc(db, "orders", id), {
      status: "delivered",
    });
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl mb-6">Delivery Panel</h1>

      {orders.length === 0 && (
        <div>No active assigned orders.</div>
      )}

      {orders.map((order) => (
        <div key={order.id} className="bg-white p-6 shadow rounded mb-8">

          <div className="font-medium mb-2">
            Order ID: {order.id}
          </div>

          <TrackingMap
            userLat={order.deliveryDetails.lat}
            userLng={order.deliveryDetails.lng}
            deliveryLat={order.deliveryLocation?.lat}
            deliveryLng={order.deliveryLocation?.lng}
          />

          <a
            href={`https://www.google.com/maps?q=${order.deliveryDetails.lat},${order.deliveryDetails.lng}`}
            target="_blank"
            className="text-blue-600 underline block mt-3"
          >
            Open in Google Maps
          </a>

          <button
            onClick={() => markDelivered(order.id)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            Mark Delivered
          </button>

        </div>
      ))}
    </div>
  );
}