"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const bikeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
  iconSize: [40, 40],
});

const homeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c * 1000).toFixed(0);
}

export default function TrackingMap({
  userLat,
  userLng,
  deliveryLat,
  deliveryLng,
}) {
  const center = deliveryLat
    ? [deliveryLat, deliveryLng]
    : [userLat, userLng];

  const distance =
    deliveryLat &&
    calculateDistance(
      userLat,
      userLng,
      deliveryLat,
      deliveryLng
    );

  return (
    <div className="mt-4">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "350px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[userLat, userLng]}
          icon={homeIcon}
        >
          <Popup>Customer Location</Popup>
        </Marker>

        {deliveryLat && (
          <Marker
            position={[deliveryLat, deliveryLng]}
            icon={bikeIcon}
          >
            <Popup>Delivery Boy</Popup>
          </Marker>
        )}
      </MapContainer>

      {distance && (
        <div className="mt-3 text-sm text-gray-700 font-medium">
          Delivery is {distance} meters away
        </div>
      )}
    </div>
  );
}