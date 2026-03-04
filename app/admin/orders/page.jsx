"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminOrdersPage() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
     FETCH ORDERS (REALTIME)
  ================================ */
  useEffect(() => {

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);
      setLoading(false);

    });

    return () => unsub();

  }, []);

  /* ===============================
     UPDATE ORDER STATUS
  ================================ */
  const updateStatus = async (orderId, status) => {

    try {

      const updateData = {
        status,
        updatedAt: serverTimestamp(),
      };

      /* =====================================
         WHEN ORDER READY → BROADCAST TO DELIVERY
      ====================================== */

      if (status === "ready") {

        updateData.assignedTo = null;
        updateData.deliveryLocation = null;

      }

      await updateDoc(doc(db, "orders", orderId), updateData);

    } catch (error) {

      console.error("Status update failed:", error);

    }

  };

  /* ===============================
     STATUS COLOR
  ================================ */
  const getStatusColor = (status) => {

    switch (status) {

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "preparing":
        return "bg-blue-100 text-blue-700";

      case "ready":
        return "bg-indigo-100 text-indigo-700";

      case "out_for_delivery":
        return "bg-purple-100 text-purple-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";

    }

  };

  /* ===============================
     UI
  ================================ */

  return (
    <div className="min-h-screen bg-gray-50 p-10">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-semibold mb-8">
          Order Management
        </h1>

        {loading ? (

          <div>Loading orders...</div>

        ) : (

          <div className="bg-white rounded-2xl shadow overflow-hidden">

            <table className="w-full text-left">

              <thead className="bg-gray-100 text-sm">

                <tr>
                  <th className="p-4">Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                </tr>

              </thead>

              <tbody>

                {orders.map((order) => (

                  <tr key={order.id} className="border-t">

                    {/* ORDER ID */}
                    <td className="p-4 text-xs">
                      {order.id}
                    </td>

                    {/* CUSTOMER */}
                    <td className="text-sm">
                      {order.deliveryDetails?.fullName || "N/A"}
                    </td>

                    {/* ITEMS */}
                    <td>

                      {order.items?.map((item, i) => (

                        <div key={i} className="text-sm">
                          {item.name} x {item.quantity}
                        </div>

                      ))}

                    </td>

                    {/* TOTAL */}
                    <td className="font-medium">
                      ₹ {order.totalAmount}
                    </td>

                    {/* STATUS */}
                    <td>

                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order.id, e.target.value)
                        }
                        className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >

                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="out_for_delivery">
                          Out For Delivery
                        </option>
                        <option value="delivered">
                          Delivered
                        </option>

                      </select>

                    </td>

                    {/* ASSIGNED DELIVERY */}
                    <td className="text-sm">

                      {order.assignedTo
                        ? order.assignedTo
                        : "Waiting for Delivery Boy"}

                    </td>

                  </tr>

                ))}

                {orders.length === 0 && (

                  <tr>

                    <td
                      colSpan="6"
                      className="p-6 text-center text-gray-500"
                    >
                      No orders available.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}