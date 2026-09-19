import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Search,
  Building2,
  Clock,
  Phone,
  Navigation,
  ExternalLink,
  Filter,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../Components/MapComponent';

const PharmacyLocator = () => {
  const { userLocation, requestUserLocation } = useAuth();

  const [pharmacies, setPharmacies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [is24HoursOnly, setIs24HoursOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState(25);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPharmacies();
  }, [searchTerm, is24HoursOnly, radiusKm, userLocation]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (is24HoursOnly) params.append('is_24_hours', 'true');
      if (radiusKm) params.append('radius_km', radiusKm);
      if (userLocation.latitude && userLocation.longitude) {
        params.append('user_lat', userLocation.latitude);
        params.append('user_lng', userLocation.longitude);
      }

      const res = await api.get(`/pharmacies?${params.toString()}`);
      if (res.data.success) {
        setPharmacies(res.data.data);
        if (res.data.data.length > 0 && !selectedPharmacy) {
          setSelectedPharmacy(res.data.data[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching pharmacies:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Interactive Pharmacy Locator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Locate registered healthcare centers, dispensaries, and 24/7 pharmacies across your region.
            </p>
          </div>

          <button
            onClick={requestUserLocation}
            className="self-start sm:self-auto px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Navigation className="w-4 h-4 text-sky-600" />
            Refresh GPS Location
          </button>
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-4">
          {/* Search Box */}
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pharmacy name, neighborhood, or street..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Radius Filter Slider */}
          <div className="w-full md:w-64 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Radius: {radiusKm} km</span>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

          {/* 24/7 Filter */}
          <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap">
            <input
              type="checkbox"
              checked={is24HoursOnly}
              onChange={(e) => setIs24HoursOnly(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded-md focus:ring-sky-500"
            />
            <span className="text-xs font-bold text-slate-700">24/7 Open Only</span>
          </label>
        </div>

        {/* Map & List Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Pharmacy List (col-span 5) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pharmacies in Radius ({pharmacies.length})
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">Locating nearby pharmacies...</p>
              </div>
            ) : pharmacies.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
                No pharmacies found within {radiusKm} km radius. Try increasing the search radius slider.
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {pharmacies.map((pharm) => {
                  const isSelected = selectedPharmacy?.pharmacy_id === pharm.pharmacy_id;

                  return (
                    <div
                      key={pharm.pharmacy_id}
                      onClick={() => setSelectedPharmacy(pharm)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50/90 border-sky-500 shadow-md ring-2 ring-sky-500/20'
                          : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900">{pharm.pharmacy_name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">📍 {pharm.address}, {pharm.city}</p>
                        </div>
                        {pharm.is_24_hours && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            24/7 Open
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">📞 {pharm.phone}</span>
                          {pharm.distance_km !== null && (
                            <span className="font-bold text-emerald-600">🚗 {pharm.distance_km} km</span>
                          )}
                        </div>

                        <Link
                          to={`/pharmacy-details/${pharm.pharmacy_id}`}
                          className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-0.5"
                        >
                          <span>Full Stock</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Interactive Full Height Map (col-span 7) */}
          <div className="lg:col-span-7">
            <MapComponent
              pharmacies={pharmacies}
              userLocation={userLocation}
              selectedPharmacyId={selectedPharmacy?.pharmacy_id}
              onSelectPharmacy={(p) => setSelectedPharmacy(p)}
              height="600px"
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default PharmacyLocator;
