"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  runTransaction,
} from "firebase/firestore";

import { db, auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const TrackingMap = dynamic(
  () => import("@/components/TrackingMap"),
  { ssr: false }
);

export default function DeliveryPage() {

  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [user, setUser] = useState(undefined);

  /* ===============================
     WAIT FOR AUTH
  ================================ */

  useEffect(() => {

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
    });

    return () => unsub();

  }, []);

  /* ===============================
     REDIRECT IF LOGGED OUT
  ================================ */

  useEffect(() => {

    if (user === null) {
      router.push("/login");
    }

  }, [user, router]);

  /* ===============================
     LOGOUT
  ================================ */

  const handleLogout = async () => {

    await signOut(auth);
    router.push("/login");

  };

  /* ===============================
     FETCH AVAILABLE ORDERS
  ================================ */

  useEffect(() => {

    const q = query(
      collection(db, "orders"),
      where("status", "==", "ready"),
      where("assignedTo", "==", null)
    );

    const unsub = onSnapshot(q, (snap) => {

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setAvailableOrders(data);

    });

    return () => unsub();

  }, []);

  /* ===============================
     FETCH ACTIVE DELIVERY
  ================================ */

  useEffect(() => {

    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("assignedTo", "==", user.uid),
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

  }, [user]);

  /* ===============================
     ACCEPT ORDER
  ================================ */

  const acceptOrder = async (orderId) => {

    const orderRef = doc(db, "orders", orderId);

    await runTransaction(db, async (transaction) => {

      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists()) return;

      const order = orderDoc.data();

      if (order.assignedTo) {
        alert("Order already taken");
        return;
      }

      transaction.update(orderRef, {
        assignedTo: user.uid,
        status: "out_for_delivery",
        deliveryLocation: {
          lat: null,
          lng: null,
        },
      });

    });

  };

  /* ===============================
     LIVE LOCATION TRACKING
  ================================ */

  useEffect(() => {

    if (!user || orders.length === 0) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const orderId = orders[0].id;

        await updateDoc(doc(db, "orders", orderId), {
          deliveryLocation: { lat, lng },
        });

      },
      (err) => console.log(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);

  }, [orders, user]);

  /* ===============================
     MARK DELIVERED
  ================================ */

  const markDelivered = async (id) => {

    await updateDoc(doc(db, "orders", id), {
      status: "delivered",
    });

  };

  if (user === undefined) {
    return <div className="p-10">Loading...</div>;
  }

  return (

    <div className="p-10">

      <div className="flex justify-between mb-6">

        <h1 className="text-3xl">Delivery Panel</h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>

      </div>

      {/* AVAILABLE ORDERS */}

      <h2 className="text-xl mb-4">Available Orders</h2>

      {availableOrders.length === 0 && (
        <div className="mb-8 text-gray-500">
          No available orders right now.
        </div>
      )}

      {availableOrders.map((order) => (

        <div
          key={order.id}
          className="bg-yellow-50 p-5 rounded shadow mb-4"
        >

          <div>Order ID: {order.id}</div>
          <div>Customer: {order.deliveryDetails?.fullName}</div>
          <div>Total: ₹{order.totalAmount}</div>

          <button
            onClick={() => acceptOrder(order.id)}
            className="bg-blue-600 text-white px-4 py-2 mt-3 rounded"
          >
            Accept Order
          </button>

        </div>

      ))}

      {/* ACTIVE DELIVERIES */}

      <h2 className="text-xl mt-10 mb-4">Active Deliveries</h2>

      {orders.length === 0 && (
        <div>No active assigned orders.</div>
      )}

      {orders.map((order) => (

        <div key={order.id} className="bg-white p-6 shadow rounded mb-8">

          <div className="font-medium mb-2">
            Order ID: {order.id}
          </div>

          <TrackingMap
            userLat={Number(order.deliveryDetails?.lat)}
            userLng={Number(order.deliveryDetails?.lng)}
            deliveryLat={Number(order.deliveryLocation?.lat)}
            deliveryLng={Number(order.deliveryLocation?.lng)}
          />

          <a
            href={`https://www.google.com/maps?q=${order.deliveryDetails?.lat},${order.deliveryDetails?.lng}`}
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