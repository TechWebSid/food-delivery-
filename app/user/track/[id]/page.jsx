"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const TrackingMap = dynamic(
  () => import("@/components/TrackingMap"),
  { ssr: false }
);

// 🔥 Distance Calculator
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (value) => (value * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export default function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "orders", id),
      (snap) => {
        const data = { id: snap.id, ...snap.data() };
        setOrder(data);

        if (
          data.deliveryLocation &&
          data.deliveryDetails
        ) {
          const dist = calculateDistance(
            data.deliveryDetails.lat,
            data.deliveryDetails.lng,
            data.deliveryLocation.lat,
            data.deliveryLocation.lng
          );

          setDistance(dist);
        }
      }
    );

    return () => unsub();
  }, [id]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow">

        <h1 className="text-2xl font-semibold mb-4">
          Live Tracking
        </h1>

        <div className="mb-4">
          Status:{" "}
          <span className="font-semibold">
            {order.status.replaceAll("_", " ")}
          </span>
        </div>

        {distance && (
          <div className="mb-4 text-green-600 font-medium">
            Delivery Boy is {distance} meters away
          </div>
        )}

        {order.deliveryDetails?.lat && (
          <TrackingMap
            userLat={order.deliveryDetails.lat}
            userLng={order.deliveryDetails.lng}
            deliveryLat={order.deliveryLocation?.lat}
            deliveryLng={order.deliveryLocation?.lng}
          />
        )}
      </div>
    </div>
  );
}