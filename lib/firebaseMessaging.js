import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase";

export const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("Notification permission denied");
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    return token;
  } catch (err) {
    console.error("Token error:", err);
  }
};

export const listenForegroundNotification = (callback) => {
  onMessage(messaging, (payload) => {
    callback(payload);
  });
};