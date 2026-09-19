import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  Upload,
  Bell,
  Clock,
  MapPin,
  Pill,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  FileText
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeReservations, setActiveReservations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resRes, prescRes, notifRes] = await Promise.all([
          api.get('/reservations?status=Pending'),
          api.get('/prescriptions'),
          api.get('/notifications')
        ]);

        if (resRes.data.success) {
          setActiveReservations(resRes.data.data);
        }
        if (prescRes.data.success) {
          setPrescriptions(resRes.data.data ? prescRes.data.data.slice(0, 3) : []);
        }
        if (notifRes.data.success) {
          setNotifications(notifRes.data.data ? notifRes.data.data.slice(0, 4) : []);
        }
      } catch (e) {
        console.error('Patient dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white uppercase tracking-wider">
              Patient Healthcare Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              Hello, {user?.full_name || 'Patient'}!
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-xl">
              Track your active medicine reservations, upload prescription slips, and find urgent medications in-stock across your metropolitan network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/search"
              className="px-5 py-3 bg-white text-sky-700 font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:bg-sky-50 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-sky-600" />
              <span>Search Stock</span>
            </Link>
            <Link
              to="/patient/prescriptions"
              className="px-5 py-3 bg-sky-800/80 hover:bg-sky-800 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Prescription</span>
            </Link>
          </div>
        </div>

        {/* 3 Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">{activeReservations.length}</span>
              <span className="text-xs text-slate-500 block font-semibold">Active Holds / Reservations</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">{prescriptions.length}</span>
              <span className="text-xs text-slate-500 block font-semibold">Prescriptions Logged</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">{notifications.length}</span>
              <span className="text-xs text-slate-500 block font-semibold">Recent Alerts & Updates</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Active Reservations & Live Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active Reservations (col-span 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  Active Reservations Awaiting Pick-Up
                </h2>
                <Link
                  to="/patient/reservations"
                  className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-0.5"
                >
                  <span>View All History</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading active reservations...</div>
              ) : activeReservations.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                    <Pill className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-700">No active pending holds</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Search medications across nearby pharmacies and place a digital reservation.
                  </p>
                  <Link
                    to="/search"
                    className="inline-block px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold"
                  >
                    Search Medicine Radar
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeReservations.map((res) => (
                    <div key={res.reservation_id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                            {res.reservation_code}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            res.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {res.status}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900">{res.medicine_name}</h4>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3">
                          <span>🏢 {res.pharmacy_name}</span>
                          <span>📦 Qty: {res.quantity} Units</span>
                          <span className="font-bold text-emerald-600">${parseFloat(res.total_price).toFixed(2)}</span>
                        </div>
                      </div>

                      <Link
                        to="/patient/reservations"
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors self-start sm:self-center"
                      >
                        View Voucher
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Notifications & Prescription Summary (col-span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Notifications Feed */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-sky-600" />
                  Recent Alerts & Updates
                </h3>
                <Link to="/patient/notifications" className="text-xs font-bold text-sky-600 hover:underline">
                  All
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No alerts yet.</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.notification_id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 text-xs">
                      <div className="mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{notif.title}</div>
                        <p className="text-slate-600 mt-0.5">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Support / Complaint quick box */}
            <div className="bg-sky-50 border border-sky-100 rounded-3xl p-5 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-sky-800">
                Need Help or Pharmacy Feedback?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Report inaccurate pharmacy stock listings or contact system support.
              </p>
              <Link
                to="/patient/complaints"
                className="inline-block px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Open Support Inquiry
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
