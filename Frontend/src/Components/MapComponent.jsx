import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Phone, Clock, ExternalLink } from 'lucide-react';

const MapComponent = ({
  center = [40.7128, -74.0060],
  zoom = 13,
  pharmacies = [],
  userLocation = null,
  selectedPharmacyId = null,
  onSelectPharmacy = null,
  height = '500px'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false
      });

      // Add Tile Layer from OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Custom Zoom Control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive or clean up
    };
  }, []);

  // Update Markers whenever pharmacies or user location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const bounds = [];

    // Add Patient Location Marker if available
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      const userLatLng = [userLocation.latitude, userLocation.longitude];
      bounds.push(userLatLng);

      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: rgba(14, 165, 233, 0.3);
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #0284c7;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const userMarker = L.marker(userLatLng, { icon: userIcon });
      userMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #0284c7; font-size: 13px;">📍 Your Current Location</strong>
          <p style="margin: 4px 0 0; font-size: 11px; color: #64748b;">Searching within your radius.</p>
        </div>
      `);
      markersGroup.addLayer(userMarker);
    }

    // Add Pharmacy Markers
    pharmacies.forEach((pharmacy) => {
      if (!pharmacy.latitude || !pharmacy.longitude) return;

      const latLng = [parseFloat(pharmacy.latitude), parseFloat(pharmacy.longitude)];
      bounds.push(latLng);

      const isSelected = selectedPharmacyId === pharmacy.pharmacy_id;
      const is24Hours = pharmacy.is_24_hours;

      // Determine marker color
      let markerBg = '#059669'; // Emerald / In stock
      if (pharmacy.available_stock === 0 || pharmacy.computed_status === 'Out of Stock') {
        markerBg = '#64748b'; // Gray
      } else if (pharmacy.computed_status === 'Low Stock') {
        markerBg = '#d97706'; // Amber
      }

      const pharmIcon = L.divIcon({
        className: 'custom-pharm-marker',
        html: `
          <div style="
            background: ${markerBg};
            width: ${isSelected ? '38px' : '32px'};
            height: ${isSelected ? '38px' : '32px'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: ${isSelected ? '14px' : '12px'};
              font-weight: bold;
            ">Rx</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      const marker = L.marker(latLng, { icon: pharmIcon });

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 220px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <strong style="color: #0f172a; font-size: 14px;">${pharmacy.pharmacy_name}</strong>
          </div>
          <div style="margin-top: 4px; font-size: 11px; color: #475569;">
            <div>🏢 ${pharmacy.address || ''}, ${pharmacy.city || ''}</div>
            <div style="margin-top: 2px;">📞 ${pharmacy.phone || ''}</div>
            <div style="margin-top: 2px; color: #0284c7; font-weight: 600;">
              ⏰ ${pharmacy.opening_hours || (is24Hours ? '24 Hours Open' : 'Open')}
            </div>
            ${
              pharmacy.distance_km !== undefined && pharmacy.distance_km !== null
                ? `<div style="margin-top: 4px; font-weight: 700; color: #059669;">🚗 ${pharmacy.distance_km} km away</div>`
                : ''
            }
            ${
              pharmacy.price
                ? `<div style="margin-top: 4px; font-size: 12px; font-weight: 800; color: #0284c7;">Price: KSh ${parseFloat(pharmacy.price).toFixed(2)}</div>`
                : ''
            }
          </div>
          <div style="margin-top: 8px; pt-2; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}" target="_blank" rel="noopener noreferrer" style="color: #0284c7; text-decoration: none; font-size: 11px; font-weight: bold;">
              Directions ↗
            </a>
            <a href="/pharmacy-details/${pharmacy.pharmacy_id}" style="background: #059669; color: white; padding: 3px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
              View Stock
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectPharmacy) {
          onSelectPharmacy(pharmacy);
        }
      });

      markersGroup.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // Auto-fit bounds if we have points
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
  }, [pharmacies, userLocation, selectedPharmacyId, onSelectPharmacy]);

  const handleCenterUser = () => {
    if (mapInstanceRef.current && userLocation && userLocation.latitude && userLocation.longitude) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 14);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Recenter Control */}
      {userLocation && userLocation.latitude && (
        <button
          onClick={handleCenterUser}
          className="absolute bottom-4 right-4 z-20 bg-white text-slate-700 hover:text-sky-600 px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          title="Center to my location"
        >
          <Navigation className="w-4 h-4 text-sky-600" />
          My Location
        </button>
      )}
    </div>
  );
};

export default MapComponent;
