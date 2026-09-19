import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Search,
  Pill,
  CalendarCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReserveModal from '../Components/ReserveModal';

const PharmacyDetails = () => {
  const { id } = useParams();
  const { userLocation } = useAuth();

  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  // Reservation Modal
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    fetchPharmacyDetails();
  }, [id, searchTerm, categoryFilter, userLocation]);

  const fetchPharmacyDetails = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'All') params.append('category', categoryFilter);
      if (userLocation.latitude && userLocation.longitude) {
        params.append('user_lat', userLocation.latitude);
        params.append('user_lng', userLocation.longitude);
      }

      const res = await api.get(`/pharmacies/${id}?${params.toString()}`);
      if (res.data.success) {
        setPharmacy(res.data.pharmacy);
        setInventory(res.data.inventory);

        // Extract distinct categories
        const distinctCats = ['All', ...new Set(res.data.inventory.map(i => i.category))];
        setCategories(distinctCats);
      }
    } catch (e) {
      console.error('Failed to load pharmacy details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReserve = (item) => {
    setActiveItem({
      medicine: item,
      pharmacy: pharmacy,
      inventoryItem: item
    });
    setReserveModalOpen(true);
  };

  if (loading && !pharmacy) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading pharmacy profile and live inventory...</p>
        </div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Pharmacy Not Found</h2>
        <p className="text-xs text-slate-500">The pharmacy you requested does not exist or has been removed.</p>
        <Link to="/locator" className="inline-block px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold">
          Return to Pharmacy Locator
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <Link
          to="/locator"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Locator Map
        </Link>

        {/* Pharmacy Profile Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Verified Registered Dispensary
              </span>
              {pharmacy.is_24_hours && (
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                  24/7 Hours
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{pharmacy.pharmacy_name}</h1>
            
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {pharmacy.address}, {pharmacy.city}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-sky-600" />
                {pharmacy.phone}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {pharmacy.opening_hours}
              </span>
              {pharmacy.distance_km !== null && (
                <span className="font-bold text-emerald-600">
                  🚗 {pharmacy.distance_km} km from you
                </span>
              )}
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all self-start md:self-center"
          >
            <MapPin className="w-4 h-4" />
            Get Driving Directions
          </a>
        </div>

        {/* Pharmacy Inventory Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                Live In-Stock Medicines ({inventory.length})
              </h2>
              <p className="text-xs text-slate-500">Real-time stock synchronized with pharmacy dispensing records.</p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter stock..."
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
              >
                {categories.map(c => (
                  <option key={c} value={c}>Category: {c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {inventory.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No matching medications in stock for this pharmacy.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {inventory.map((item) => (
                <div
                  key={item.inventory_id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{item.medicine_name}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-700">
                        {item.category}
                      </span>
                      {item.requires_prescription && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700">
                          Prescription Req.
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      {item.generic_name || item.manufacturer} • Form: {item.dosage_form} {item.strength && `(${item.strength})`}
                    </p>

                    <div className="flex items-center gap-2 text-xs pt-1">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.computed_status === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.computed_status === 'Low Stock'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.available_stock} Units Available ({item.computed_status})
                      </span>
                      {item.expiry_date && (
                        <span className="text-[10px] text-slate-400">
                          Expiry: {new Date(item.expiry_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Unit Price</span>
                      <span className="text-lg font-extrabold text-slate-900">KSh {parseFloat(item.price).toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => handleOpenReserve(item)}
                      disabled={item.available_stock === 0}
                      className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-40 flex items-center gap-1.5 transition-all"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Reserve Stock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Reservation Modal */}
      {activeItem && (
        <ReserveModal
          isOpen={reserveModalOpen}
          onClose={() => setReserveModalOpen(false)}
          medicine={activeItem.medicine}
          pharmacy={activeItem.pharmacy}
          inventoryItem={activeItem.inventoryItem}
          onReservationSuccess={() => fetchPharmacyDetails()}
        />
      )}
    </div>
  );
};

export default PharmacyDetails;
