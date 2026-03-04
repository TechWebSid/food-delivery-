importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCU93IfQlD0utITrGJUAt4_3d_1CBNaDPY",
  authDomain: "brotherhood-e93f6.firebaseapp.com",
  projectId: "brotherhood-e93f6",
  messagingSenderId: "83673372918",
  appId: "1:83673372918:web:2e29a2019985a868c334d7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {

  console.log("Background notification received:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png",
    vibrate: [200, 100, 200],
  });

});