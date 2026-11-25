
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, LocateFixed } from 'lucide-react';

const DEFAULT_CENTER = [-1.286389, 36.817223]; // Nairobi (display only)

const PharmacyLocationPicker = ({
  latitude,
  longitude,
  onLocationSelect
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const map = L.map(mapRef.current).setView(DEFAULT_CENTER, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    map.on('click', (event) => {
      const { lat, lng } = event.latlng;
      updateMarker(lat, lng);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const updateMarker = (lat, lng) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], {
        draggable: true
      }).addTo(map);

      markerRef.current.on('dragend', () => {
        const position = markerRef.current.getLatLng();
        onLocationSelect(position.lat, position.lng);
      });
    }

    onLocationSelect(lat, lng);
  };

  useEffect(() => {
    if (
      latitude == null ||
      longitude == null ||
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude))
    ) {
      return;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    updateMarker(lat, lng);
    map.setView([lat, lng], 16);
  }, [latitude, longitude]);

  const captureCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Your browser does not support location services.');
      return;
    }

    setGpsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        updateMarker(lat, lng);
        mapInstanceRef.current?.setView([lat, lng], 17);

        setGpsLoading(false);
      },
      (locationError) => {
        setGpsLoading(false);

        if (locationError.code === 1) {
          setError('Location permission was denied. You can still select the pharmacy on the map.');
        } else if (locationError.code === 3) {
          setError('Location request timed out. Please try again.');
        } else {
          setError('Unable to get your current location. Please select the pharmacy on the map.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Pharmacy Map Location
          </h3>
          <p className="text-xs text-slate-500">
            Click the map to place a pin, then drag it to adjust.
          </p>
        </div>

        <button
          type="button"
          onClick={captureCurrentLocation}
          disabled={gpsLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold disabled:opacity-50"
        >
          <LocateFixed size={15} />
          {gpsLoading ? 'Locating...' : 'Use GPS'}
        </button>
      </div>

      <div
        ref={mapRef}
        className="w-full h-72 rounded-xl border border-slate-200 z-0"
      />

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {latitude != null && longitude != null ? (
        <div className="flex items-center gap-2 text-xs text-emerald-700">
          <MapPin size={15} />
          <span>
            Selected coordinates: {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
          </span>
        </div>
      ) : (
        <p className="text-xs text-amber-700">
          No pharmacy location selected yet. Select the pharmacy premises on the map.
        </p>
      )}
    </div>
  );
};

export default PharmacyLocationPicker;
