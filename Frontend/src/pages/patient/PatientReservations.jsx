import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Printer,
  Ban,
  Search,
  Filter
} from 'lucide-react';
import api from '../../services/api';

const PatientReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [cancelModalRes, setCancelModalRes] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, searchTerm]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/reservations?${params.toString()}`);
      if (res.data.success) {
        setReservations(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load reservations:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      setActionLoadingId(reservationId);
      const res = await api.put(`/reservations/${reservationId}/status`, {
        status: 'Cancelled',
        rejection_reason: cancelReason || 'Cancelled by patient.'
      });

      if (res.data.success) {
        setMessage('Reservation cancelled and stock released.');
        setCancelModalRes(null);
        setCancelReason('');
        fetchReservations();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case 'Collected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Collected
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 flex items-center gap-1">
            <Ban className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Medicine Reservations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Track status, present digital pick-up codes at the counter, or cancel holds.
            </p>
          </div>
        </div>

        {message && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-emerald-600 hover:text-emerald-800">Dismiss</button>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by reservation code or medication name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Collected">Collected</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Declined</option>
            </select>
          </div>
        </div>

        {/* Reservations Cards List */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
            <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading reservation records...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-700">No reservations found</h3>
            <p className="text-xs text-slate-500">
              You do not have any reservations matching this filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((res) => (
              <div
                key={res.reservation_id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Top Bar: Code & Status */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="font-mono font-extrabold text-xs text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                      {res.reservation_code}
                    </span>
                    {getStatusBadge(res.status)}
                  </div>

                  {/* Medicine & Pharmacy */}
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{res.medicine_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-semibold">🏢 {res.pharmacy_name}</p>
                    <p className="text-xs text-slate-500">📍 {res.pharmacy_address}, {res.pharmacy_city}</p>
                    <p className="text-xs text-slate-500">📞 {res.pharmacy_phone}</p>
                  </div>

                  {/* Pricing and details */}
                  <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Quantity Reserved:</span>
                      <span className="font-bold text-slate-800">{res.quantity} Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Price:</span>
                      <span className="font-extrabold text-emerald-600 text-sm">
                        ${parseFloat(res.total_price).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/60 pt-1.5 text-[11px]">
                      <span className="text-slate-400">Reserved On:</span>
                      <span className="text-slate-600">{new Date(res.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {res.rejection_reason && (
                    <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-700">
                      <strong>Reason:</strong> {res.rejection_reason}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-xs font-bold text-slate-600 hover:text-sky-600 rounded-xl hover:bg-slate-50 flex items-center gap-1"
                    title="Print pick-up voucher"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>

                  {(res.status === 'Pending' || res.status === 'Confirmed') && (
                    <button
                      onClick={() => setCancelModalRes(res)}
                      disabled={actionLoadingId === res.reservation_id}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-40"
                    >
                      Cancel Hold
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalRes && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Cancel Reservation?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel reservation <strong>{cancelModalRes.reservation_code}</strong> for {cancelModalRes.medicine_name}? The reserved quantity will be immediately unlocked.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cancellation Reason (Optional)</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Purchased elsewhere, doctor changed prescription..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalRes(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                onClick={() => handleCancelReservation(cancelModalRes.reservation_id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientReservations;
