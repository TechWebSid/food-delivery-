"use client";

import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        router.push("/login");
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();

      if (!data) {
        router.push("/login");
        return;
      }

      if (data.role === "admin") {
        router.push("/admin");
      } 
      else if (data.role === "delivery") {
        if (!data.approved) {
          router.push("/waiting");
        } else {
          router.push("/delivery");
        }
      } 
      else {
        router.push("/user/dashboard"); // ✅ FIXED
      }

    });

    return () => unsubscribe();
  }, []);

  return null; // No UI needed because redirect
}