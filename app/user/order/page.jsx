"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const LocationMap = dynamic(
  () => import("@/components/LocationMap"),
  { ssr: false }
);

export default function OrderPage() {
  const router = useRouter();
  const { cart, totalAmount, clearCart } = useCart();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    pincode: "",
    landmark: "",
    lat: "",
    lng: "",
  });

  const [loading, setLoading] = useState(false);

  // Load saved address
  useEffect(() => {
    const loadAddress = async () => {
      if (!auth.currentUser) return;

      const snap = await getDoc(
        doc(db, "users", auth.currentUser.uid)
      );

      const data = snap.data();
      if (data?.address) {
        setAddress(data.address);
      }
    };

    loadAddress();
  }, []);

  // 🔥 Better UX Live Location
  const getLiveLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          );

          const data = await res.json();

          setAddress((prev) => ({
            ...prev,
            lat,
            lng,
            addressLine:
              data.address?.road ||
              data.display_name ||
              "",
            city:
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              "",
            pincode: data.address?.postcode || "",
          }));
        } catch (err) {
          console.error("Reverse geocoding failed", err);
        }
      },
      (error) => {
        if (error.code === 1) {
          alert("Please allow location permission");
        }
      }
    );
  };

 const placeOrder = async () => {

  if (cart.length === 0)
    return alert("Cart empty");

  if (
    !address.fullName ||
    !address.phone ||
    !address.addressLine ||
    !address.landmark
  )
    return alert("Fill all required fields");

  try {

    setLoading(true);

    // create razorpay order
    const res = await fetch("/api/razorpay", {
      method: "POST",
      body: JSON.stringify({ amount: totalAmount }),
    });

    const data = await res.json();

    const options = {
      key: "rzp_test_SN8KH9tvKTS5Gt",
      amount: data.amount,
      currency: "INR",
      name: "Brotherhood Restaurant",
      description: "Food Order Payment",
      order_id: data.id,

      handler: async function (response) {

        await updateDoc(
          doc(db, "users", auth.currentUser.uid),
          { address }
        );

        await addDoc(collection(db, "orders"), {
          userId: auth.currentUser.uid,
          items: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalAmount,
          status: "pending",
          assignedTo: null,
          paymentMethod: "Razorpay",
          paymentStatus: "paid",
          razorpayPaymentId: response.razorpay_payment_id,
          deliveryDetails: address,
          createdAt: serverTimestamp(),
        });

        clearCart();

        router.push("/user/order-success");

      },

      prefill: {
        name: address.fullName,
        contact: address.phone,
      },

      theme: {
        color: "#16a34a",
      },
    };

    const razor = new window.Razorpay(options);

    razor.open();

  } catch (err) {

    alert(err.message);

  } finally {

    setLoading(false);

  }

};

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-semibold mb-8">
          Checkout
        </h1>

        <div className="bg-white p-6 rounded-xl shadow space-y-4">

          <input
            placeholder="Full Name"
            value={address.fullName}
            onChange={(e) =>
              setAddress({ ...address, fullName: e.target.value })
            }
            className="border p-3 rounded w-full"
          />

          <input
            placeholder="Phone"
            value={address.phone}
            onChange={(e) =>
              setAddress({ ...address, phone: e.target.value })
            }
            className="border p-3 rounded w-full"
          />

          <textarea
            placeholder="Address Line (Auto-filled)"
            value={address.addressLine}
            onChange={(e) =>
              setAddress({
                ...address,
                addressLine: e.target.value,
              })
            }
            className="border p-3 rounded w-full"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="City"
              value={address.city}
              onChange={(e) =>
                setAddress({ ...address, city: e.target.value })
              }
              className="border p-3 rounded"
            />

            <input
              placeholder="Pincode"
              value={address.pincode}
              onChange={(e) =>
                setAddress({ ...address, pincode: e.target.value })
              }
              className="border p-3 rounded"
            />
          </div>

          {/* 🔥 Landmark Required */}
          <input
            placeholder="Landmark (Required)"
            value={address.landmark}
            onChange={(e) =>
              setAddress({ ...address, landmark: e.target.value })
            }
            className="border p-3 rounded w-full"
          />

          <button
            onClick={getLiveLocation}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            📍 Use Live Location
          </button>

          {address.lat && (
            <p className="text-sm text-green-600">
              Location captured ✔
            </p>
          )}

          {/* Map */}
          <div className="mt-4">
            <LocationMap
              lat={address.lat}
              lng={address.lng}
              setLatLng={(latlng) =>
                setAddress((prev) => ({
                  ...prev,
                  lat: latlng.lat,
                  lng: latlng.lng,
                }))
              }
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Order Summary
          </h2>

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between py-2 border-b"
            >
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>
                ₹ {item.price * item.quantity}
              </span>
            </div>
          ))}

          <div className="flex justify-between mt-4 font-semibold">
            <span>Total</span>
            <span>₹ {totalAmount}</span>
          </div>

          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg"
          >
            {loading
              ? "Processing..."
              : "Make Order & Pay"}
          </button>
        </div>

      </div>
    </div>
  );
}