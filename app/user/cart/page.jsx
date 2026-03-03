"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    increaseQty,
    decreaseQty,
    totalAmount,
  } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-semibold mb-8">
          Your Cart
        </h1>

        {cart.length === 0 ? (
          <div className="text-gray-500">
            Cart is empty.
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow overflow-hidden">

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-6 border-b"
                >
                  <div>
                    <h2 className="font-semibold">
                      {item.name}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      ₹ {item.price}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        decreaseQty(item.id)
                      }
                      className="px-3 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        increaseQty(item.id)
                      }
                      className="px-3 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>

                  <div className="font-semibold">
                    ₹ {item.price * item.quantity}
                  </div>
                </div>
              ))}

            </div>

            <div className="mt-8 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Total: ₹ {totalAmount}
              </h2>

              <button
                onClick={() =>
                  router.push("/user/order")
                }
                className="bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                Proceed to Order
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}