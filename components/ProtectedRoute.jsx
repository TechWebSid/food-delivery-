"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
  allowedRole,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          router.push("/login");
          return;
        }

        const snap = await getDoc(
          doc(db, "users", user.uid)
        );

        if (!snap.exists()) {
          router.push("/login");
          return;
        }

        const userData = snap.data();

        // 🚫 Role mismatch
        if (allowedRole && userData.role !== allowedRole) {
          router.push("/login");
          return;
        }

        // 🚫 Delivery not approved
        if (
          userData.role === "delivery" &&
          userData.approved !== true
        ) {
          router.push("/waiting");
          return;
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [allowedRole]);

  if (loading) {
    return <div className="p-10">Checking access...</div>;
  }

  return children;
}