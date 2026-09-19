import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Pill,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Building2,
  CalendarCheck,
  TrendingUp,
  Activity,
  HeartPulse,
  Award,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [popularMedicines, setPopularMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pharmaciesCount, setPharmaciesCount] = useState(0);
  const [medicinesCount, setMedicinesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userLocation } = useAuth();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [medsRes, catRes, pharmRes] = await Promise.all([
          api.get('/medicines?limit=8'),
          api.get('/medicines/categories'),
          api.get('/pharmacies')
        ]);

        if (medsRes.data.success) {
          setPopularMedicines(medsRes.data.data.slice(0, 6));
          setMedicinesCount(medsRes.data.count || 0);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories.slice(0, 6));
        }
        if (pharmRes.data.success) {
          setPharmaciesCount(pharmRes.data.count || 0);
        }
      } catch (e) {
        console.error('Home data load error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-slate-50 pt-10 pb-20 lg:pt-16 lg:pb-28">
        {/* Background glow accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-sky-200/40 via-teal-200/30 to-emerald-100/40 blur-3xl -z-10 rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Real-Time Inventory Sync Operational</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Locate Critical Medicines In-Stock <span className="bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">Near You</span> Instantly.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Never waste time driving pharmacy to pharmacy during medical emergencies. 
              Search live pharmacy inventories, compare prices, check distance, and hold medicines in seconds.
            </p>

            {/* Hero Search Box */}
            <div className="pt-2 max-w-2xl mx-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="p-2 sm:p-2.5 bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-sky-900/5 border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                <div className="flex-1 flex items-center gap-3 px-3 py-2">
                  <Search className="w-5 h-5 text-sky-600 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search medicine name (e.g. Amoxicillin, Paracetamol, Ventolin)..."
                    className="w-full text-sm sm:text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Search Stock</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Fast Category Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold text-slate-600">
                <span className="text-slate-400 font-normal">Popular Searches:</span>
                {['Antibiotics', 'Analgesics', 'Antidiabetic', 'Respiratory & Asthma', 'Cardiovascular'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => navigate(`/search?category=${encodeURIComponent(cat)}`)}
                    className="px-2.5 py-1 rounded-lg bg-white/80 border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-all cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-4xl mx-auto">
              <div className="p-3.5 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200/60 shadow-xs">
                <div className="text-2xl font-black text-sky-600">{pharmaciesCount}+</div>
                <div className="text-xs font-semibold text-slate-500">Verified Pharmacies</div>
              </div>
              <div className="p-3.5 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200/60 shadow-xs">
                <div className="text-2xl font-black text-emerald-600">{medicinesCount}+</div>
                <div className="text-xs font-semibold text-slate-500">Tracked Medications</div>
              </div>
              <div className="p-3.5 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200/60 shadow-xs">
                <div className="text-2xl font-black text-indigo-600">24/7</div>
                <div className="text-xs font-semibold text-slate-500">Live Stock Updates</div>
              </div>
              <div className="p-3.5 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200/60 shadow-xs">
                <div className="text-2xl font-black text-purple-600">100%</div>
                <div className="text-xs font-semibold text-slate-500">Secure Reservations</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS WORKFLOW */}
      <section className="py-16 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
              Seamless 3-Step Process
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">How MediFind Works For You</h2>
            <p className="text-sm text-slate-500 mt-1">
              Saving patient lives and cutting emergency pharmacy queues with real-time digital sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative group hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow-md shadow-sky-600/30">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Search Medicine & View Map</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Type the medicine name or upload your prescription picture. MediFind scans all registered pharmacies within your radius.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-sky-600 group-hover:translate-x-1 transition-transform">
                <span>Explore Medicine Radar</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative group hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow-md shadow-teal-600/30">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Compare Price & Distance</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                See exact pharmacy pricing, opening hours, verified in-stock quantities, and calculated driving distance on an interactive map.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
                <span>View Map Locator</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative group hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow-md shadow-emerald-600/30">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Reserve & Collect Voucher</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Place a digital stock reservation. The pharmacy locks the units for you, sends confirmation, and you simply present your voucher.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                <span>Instant Voucher Hold</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FEATURED IN-STOCK MEDICINES */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Live Inventory Feed
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-2">Frequently Searched Medicines</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time availability status across connected metropolitan pharmacy centers.
              </p>
            </div>
            <Link
              to="/search"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700"
            >
              <span>View All Medications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularMedicines.map((med) => (
              <div
                key={med.medicine_id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700">
                      {med.category}
                    </span>
                    {med.requires_prescription ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Rx Required
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        OTC Available
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">{med.medicine_name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{med.generic_name || med.manufacturer}</p>
                  
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {med.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Available Stock</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {med.pharmacies_with_stock} Pharmacies In-Stock
                    </span>
                  </div>

                  <Link
                    to={`/search?q=${encodeURIComponent(med.medicine_name)}`}
                    className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                  >
                    <span>Check Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION FOR PHARMACIES & PATIENTS */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-semibold mb-4 border border-sky-500/30">
                <Building2 className="w-3.5 h-3.5" />
                Are You a Licensed Pharmacist?
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Connect Your Pharmacy to Thousands of Searching Patients.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed">
                Publish live stock, accept advance digital reservations, avoid dead inventory, and boost your community healthcare footprint.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-colors"
                >
                  Register Pharmacy
                </Link>
              </div>
            </div>

            {/* Safety & Compliance Card */}
            <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                Healthcare Safety & Integrity Standard
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Administrator Verification:</strong> Every pharmacy is verified against state medical licenses before approval.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Prescription Validation:</strong> Controlled prescription medications require secure patient photo uploads.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Overbooking Prevention:</strong> Automatic reservation locks prevent double-booking of scarce antibiotics and insulin.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
