import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Pill,
  CalendarCheck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  Upload,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PharmacistDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    total_items: 0,
    in_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
    expired: 0,
    total_valuation: 0
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [invRes, resRes] = await Promise.all([
        api.get('/inventory/my-inventory'),
        api.get('/reservations?status=Pending')
      ]);

      if (invRes.data.success) {
        setSummary(invRes.data.summary);
        setLowStockItems(invRes.data.data.filter(i => i.availability_status === 'Low Stock' || i.availability_status === 'Out of Stock').slice(0, 5));
      }
      if (resRes.data.success) {
        setRecentReservations(resRes.data.data.slice(0, 5));
      }
    } catch (e) {
      console.error('Pharmacist dashboard error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reservationId, status) => {
    try {
      const res = await api.put(`/reservations/${reservationId}/status`, { status });
      if (res.data.success) {
        fetchDashboard();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              Dispensary Control Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {user?.pharmacy?.pharmacy_name || 'Pharmacy Dispensary Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Welcome Dr. {user?.full_name}. Real-time inventory sync is active. Process patient holds and manage medicine batches below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/pharmacy/inventory"
              className="px-5 py-3 bg-white text-emerald-800 font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>Manage Inventory</span>
            </Link>
            <Link
              to="/pharmacy/reservations"
              className="px-5 py-3 bg-emerald-900/80 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 transition-colors flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Incoming Orders</span>
            </Link>
          </div>
        </div>

        {/* 4 Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Pending Orders</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{recentReservations.length}</span>
              <span className="text-[11px] text-amber-600 font-semibold">Requires immediate review</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Total Medicines</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{summary.total_items}</span>
              <span className="text-[11px] text-emerald-600 font-semibold">{summary.in_stock} In Stock</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Pill className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Low Stock Warnings</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">{summary.low_stock + summary.out_of_stock}</span>
              <span className="text-[11px] text-slate-400 font-semibold">&le; 5 units remaining</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Stock Valuation</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">KSh {summary.total_valuation.toFixed(2)}</span>
              <span className="text-[11px] text-sky-600 font-semibold">Active inventory asset</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Two-column Layout: Incoming Reservations Queue & Low Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Incoming Reservations Queue (col-span 7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                Pending Patient Reservation Queue ({recentReservations.length})
              </h2>
              <Link
                to="/pharmacy/reservations"
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
              >
                <span>View Full Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading incoming orders...</div>
            ) : recentReservations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No pending reservations at this moment.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentReservations.map((res) => (
                  <div key={res.reservation_id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          {res.reservation_code}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{res.patient_name}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">{res.medicine_name}</h4>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>Qty: {res.quantity} Units</span>
                        <span className="font-bold text-emerald-600">KSh {parseFloat(res.total_price).toFixed(2)}</span>
                        <span>📞 {res.patient_phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleUpdateStatus(res.reservation_id, 'Confirmed')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(res.reservation_id, 'Rejected')}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alerts & Fast Action (col-span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Urgent Restock Warnings
                </h3>
                <Link to="/pharmacy/inventory" className="text-xs font-bold text-emerald-600 hover:underline">
                  Restock
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {lowStockItems.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">All inventory levels are healthy!</div>
                ) : (
                  lowStockItems.map((item) => (
                    <div key={item.inventory_id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.medicine_name}</span>
                        <span className="text-slate-500">{item.dosage_form} • Batch: {item.batch_number || 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          item.available_stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.available_stock} Left
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Export Reports */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                Dispensary Reports & CSV Exports
              </h4>
              <p className="text-xs text-slate-600">
                Download spreadsheet reports for monthly inventory reconciliation and reservation logs.
              </p>
              <Link
                to="/pharmacy/reports"
                className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Export Reports Center
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PharmacistDashboard;
