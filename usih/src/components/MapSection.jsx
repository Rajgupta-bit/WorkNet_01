import React, { useState } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { LocateFixed, Loader2 } from "lucide-react";
import { workers } from "../data";

const providerCoords = [
  [26.7606, 83.3732],
  [26.8467, 80.9462],
  [26.4499, 80.3319],
  [25.3176, 82.9739],
  [25.4358, 81.8463],
  [26.7922, 82.1998],
  [27.1767, 78.0081],
  [28.6139, 77.2090]
];

function LocationController({ userLocation }) {
  const map = useMap();

  React.useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 13, { duration: 1.2 });
    }
  }, [userLocation, map]);

  return null;
}

export default function MapSection() {
  const center = [26.8467, 80.9462];
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const locateMe = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setLoading(false);
      },
      (error) => {
        setLoading(false);

        if (error.code === 1) {
          setLocationError("Location permission denied. Please allow location access in your browser.");
        } else if (error.code === 2) {
          setLocationError("Your location could not be detected. Please try again.");
        } else {
          setLocationError("Location request timed out. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="map-wrapper">
      <div className="map-controls">
        <button className="map-location-btn" onClick={locateMe} disabled={loading}>
          {loading ? <Loader2 size={16} className="spin" /> : <LocateFixed size={16} />}
          {loading ? "Finding you..." : "Use my location"}
        </button>

        {locationError && (
          <div className="location-error">{locationError}</div>
        )}
      </div>

      <div className="map-box">
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationController userLocation={userLocation} />

          {workers.slice(0, 8).map((worker, i) => (
            <Marker key={worker.id} position={providerCoords[i]}>
              <Popup>
                <b>{worker.name}</b><br />
                {worker.role}<br />
                ⭐ {worker.rating}
              </Popup>
            </Marker>
          ))}

          {userLocation && (
            <CircleMarker
              center={userLocation}
              radius={10}
              pathOptions={{
                color: "#16813d",
                fillColor: "#39a85b",
                fillOpacity: 0.75
              }}
            >
              <Popup>
                <b>📍 You are here</b><br />
                Your current location
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
