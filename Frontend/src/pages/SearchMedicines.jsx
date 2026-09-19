import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Pill,
  Clock,
  Building2,
  DollarSign,
  Layers,
  Map as MapIcon,
  List as ListIcon,
  ChevronRight,
  ShieldAlert,
  CalendarCheck,
  UploadCloud,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../Components/MapComponent';
import ReserveModal from '../Components/ReserveModal';

const SearchMedicines = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const { userLocation } = useAuth();

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDosage, setSelectedDosage] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest', 'price_low', 'availability'

  const [categories, setCategories] = useState([]);
  const [dosageForms, setDosageForms] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [stockingPharmacies, setStockingPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [viewMode, setViewMode] = useState('split'); // 'split', 'list', 'map'
  const [selectedPharmacyForMap, setSelectedPharmacyForMap] = useState(null);

  // Reservation Modal state
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [activeReservationTarget, setActiveReservationTarget] = useState(null);

  // Fetch filters list on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await api.get('/medicines/categories');
        if (res.data.success) {
          setCategories(['All', ...res.data.categories]);
          setDosageForms(['All', ...res.data.dosage_forms]);
        }
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    };
    fetchFilters();
  }, []);

  // Search Medicines
  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedDosage && selectedDosage !== 'All') params.append('dosage_form', selectedDosage);
      if (inStockOnly) params.append('in_stock_only', 'true');
      if (userLocation.latitude && userLocation.longitude) {
        params.append('user_lat', userLocation.latitude);
        params.append('user_lng', userLocation.longitude);
      }

      const res = await api.get(`/medicines?${params.toString()}`);
      if (res.data.success) {
        setMedicines(res.data.data);
        if (res.data.data.length > 0) {
          // Select first item by default if none selected
          fetchMedicineDetails(res.data.data[0].medicine_id);
        } else {
          setSelectedMedicine(null);
          setStockingPharmacies([]);
        }
      }
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedDosage, inStockOnly, userLocation]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const fetchMedicineDetails = async (medicineId) => {
    try {
      setLoadingDetails(true);
      const params = new URLSearchParams();
      if (userLocation.latitude && userLocation.longitude) {
        params.append('user_lat', userLocation.latitude);
        params.append('user_lng', userLocation.longitude);
      }

      const res = await api.get(`/medicines/${medicineId}?${params.toString()}`);
      if (res.data.success) {
        setSelectedMedicine(res.data.medicine);
        let pharms = res.data.pharmacies;

        // Apply sorting
        if (sortBy === 'price_low') {
          pharms.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortBy === 'availability') {
          pharms.sort((a, b) => b.available_stock - a.available_stock);
        } else {
          // Nearest
          pharms.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
        }

        setStockingPharmacies(pharms);
      }
    } catch (e) {
      console.error('Failed to load medicine details:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenReserve = (pharmacyItem) => {
    setActiveReservationTarget({
      medicine: selectedMedicine,
      pharmacy: pharmacyItem,
      inventoryItem: pharmacyItem
    });
    setReserveModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Title & Geolocation Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Medicine Availability Radar
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live stock search across verified pharmacies with map navigation and reservation locking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Location: {userLocation.hasLocation ? 'Active Coordinates' : 'Metro Area'}</span>
            </div>

            {/* View Mode Toggle */}
            <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center shadow-2xs">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  viewMode === 'split' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Split List & Map"
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Full List View"
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  viewMode === 'map' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Full Map View"
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Search & Multi-filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* Input Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medicine name, generic name, or manufacturer..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-56">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Dosage Form Filter */}
            <div className="w-full md:w-48">
              <select
                value={selectedDosage}
                onChange={(e) => setSelectedDosage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              >
                {dosageForms.map((d) => (
                  <option key={d} value={d}>
                    Form: {d}
                  </option>
                ))}
              </select>
            </div>

            {/* In-Stock Toggle */}
            <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded-md focus:ring-sky-500"
              />
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* MAIN RESULTS LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Medicines Search Results List (col-span 4 or 12 depending on view) */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div className={viewMode === 'split' ? 'lg:col-span-4 space-y-3' : 'lg:col-span-12 space-y-4'}>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Matches Found ({medicines.length})
                </span>
                <span className="text-xs text-slate-400">Click to inspect pharmacies</span>
              </div>

              {loading ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                  <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-500">Scanning pharmacy databases...</p>
                </div>
              ) : medicines.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">No matching medicines</h3>
                  <p className="text-xs text-slate-500">
                    Try adjusting search terms or clear category filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
                  {medicines.map((med) => {
                    const isSelected = selectedMedicine?.medicine_id === med.medicine_id;
                    const stockCount = Number(med.pharmacies_with_stock);

                    return (
                      <div
                        key={med.medicine_id}
                        onClick={() => fetchMedicineDetails(med.medicine_id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50/80 border-sky-500 shadow-md ring-2 ring-sky-500/20'
                            : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wide text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                              {med.category}
                            </span>
                            <h3 className="text-sm font-extrabold text-slate-900 mt-1.5">{med.medicine_name}</h3>
                            <p className="text-xs text-slate-500">{med.generic_name || med.manufacturer}</p>
                          </div>
                          {med.requires_prescription && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                              Rx Required
                            </span>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${stockCount > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <span className="font-semibold text-slate-700">
                              {stockCount > 0 ? `${stockCount} Pharmacies Stocking` : 'Currently Out of Stock'}
                            </span>
                          </div>
                          {med.min_price > 0 && (
                            <span className="font-extrabold text-slate-800">
                              From KSh {parseFloat(med.min_price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Right Column: Selected Medicine Detail + Stocking Pharmacies & Map */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={viewMode === 'split' ? 'lg:col-span-8 space-y-4' : 'lg:col-span-12 space-y-4'}>
              
              {selectedMedicine ? (
                <>
                  {/* Selected Medicine Info Banner */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                          {selectedMedicine.category}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Form: {selectedMedicine.dosage_form} {selectedMedicine.strength && `(${selectedMedicine.strength})`}
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900">{selectedMedicine.medicine_name}</h2>
                      <p className="text-xs text-slate-600 max-w-xl">{selectedMedicine.description}</p>
                    </div>

                    {/* Sorting selector */}
                    <div className="flex items-center gap-2 self-start md:self-center">
                      <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Sort By:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          fetchMedicineDetails(selectedMedicine.medicine_id);
                        }}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                      >
                        <option value="nearest">Nearest Distance</option>
                        <option value="price_low">Lowest Price</option>
                        <option value="availability">Highest Stock</option>
                      </select>
                    </div>
                  </div>

                  {/* Interactive Map Component */}
                  <MapComponent
                    pharmacies={stockingPharmacies}
                    userLocation={userLocation}
                    selectedPharmacyId={selectedPharmacyForMap?.pharmacy_id}
                    onSelectPharmacy={(p) => setSelectedPharmacyForMap(p)}
                    height="380px"
                  />

                  {/* Available Pharmacies List Card Table */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        Pharmacies Stocking {selectedMedicine.medicine_name} ({stockingPharmacies.length})
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">Updated Real-Time</span>
                    </div>

                    {loadingDetails ? (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        Loading pharmacy inventory...
                      </div>
                    ) : stockingPharmacies.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        No registered pharmacies currently have this item in stock.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {stockingPharmacies.map((pharm) => (
                          <div
                            key={pharm.inventory_id}
                            className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-sm">{pharm.pharmacy_name}</h4>
                                {pharm.is_24_hours && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    24/7 Open
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span>📍 {pharm.address}, {pharm.city}</span>
                                <span>📞 {pharm.phone}</span>
                                {pharm.distance_km !== null && (
                                  <span className="font-bold text-emerald-600">🚗 {pharm.distance_km} km away</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs pt-1">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                    pharm.computed_status === 'In Stock'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : pharm.computed_status === 'Low Stock'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {pharm.available_stock} Units Available ({pharm.computed_status})
                                </span>
                                {pharm.expiry_date && (
                                  <span className="text-slate-400 text-[10px]">
                                    Exp: {new Date(pharm.expiry_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Price & Action Buttons */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                              <div className="text-left sm:text-right">
                                <span className="text-[10px] text-slate-400 block">Unit Price</span>
                                <span className="text-lg font-black text-sky-600">
                                  KSh {parseFloat(pharm.price).toFixed(2)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${pharm.latitude},${pharm.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-slate-100 text-xs font-semibold"
                                  title="Get Google Maps Directions"
                                >
                                  Map ↗
                                </a>

                                <button
                                  onClick={() => handleOpenReserve(pharm)}
                                  disabled={pharm.available_stock === 0}
                                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-40 transition-all flex items-center gap-1"
                                >
                                  <CalendarCheck className="w-3.5 h-3.5" />
                                  Reserve
                                </button>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm">
                  Select a medicine from the list to inspect available pharmacy inventories.
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Reservation Modal */}
      {activeReservationTarget && (
        <ReserveModal
          isOpen={reserveModalOpen}
          onClose={() => setReserveModalOpen(false)}
          medicine={activeReservationTarget.medicine}
          pharmacy={activeReservationTarget.pharmacy}
          inventoryItem={activeReservationTarget.inventoryItem}
          onReservationSuccess={() => {
            if (selectedMedicine) fetchMedicineDetails(selectedMedicine.medicine_id);
          }}
        />
      )}

    </div>
  );
};

export default SearchMedicines;
