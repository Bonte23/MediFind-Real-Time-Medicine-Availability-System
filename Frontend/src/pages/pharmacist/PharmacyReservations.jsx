import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  Search,
  Check,
  Ban
} from 'lucide-react';
import api, { BACKEND_URL } from '../../services/api';

const PharmacyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Reject modal
  const [rejectModalRes, setRejectModalRes] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

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

  const handleUpdateStatus = async (reservationId, status, reason = '') => {
    try {
      setActionLoadingId(reservationId);
      const res = await api.put(`/reservations/${reservationId}/status`, {
        status,
        rejection_reason: reason
      });

      if (res.data.success) {
        setRejectModalRes(null);
        setRejectReason('');
        fetchReservations();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Status update failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Patient Reservation Processing Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review pending orders, verify prescription pictures, and dispense medicines.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code, patient name, or medicine..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Confirmed">Confirmed (Awaiting Pick-up)</option>
              <option value="Collected">Collected</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Code & Date</th>
                  <th className="py-3.5 px-4">Patient Info</th>
                  <th className="py-3.5 px-4">Medicine Item</th>
                  <th className="py-3.5 px-4">Quantity & Amount</th>
                  <th className="py-3.5 px-4">Prescription</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-400">Loading incoming orders...</td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">No reservations found.</td>
                  </tr>
                ) : (
                  reservations.map((res) => (
                    <tr key={res.reservation_id} className="hover:bg-slate-50/70 transition-colors">
                      
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 block w-fit">
                          {res.reservation_code}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {new Date(res.created_at).toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{res.patient_name}</span>
                        <span className="text-[11px] text-slate-400">📞 {res.patient_phone}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{res.medicine_name}</span>
                        <span className="text-[11px] text-slate-400">{res.dosage_form}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{res.quantity} Units</span>
                        <span className="font-extrabold text-emerald-600">${parseFloat(res.total_price).toFixed(2)}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {res.prescription_image ? (
                          <a
                            href={`${BACKEND_URL}${res.prescription_image}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Rx
                          </a>
                        ) : res.requires_prescription ? (
                          <span className="text-[10px] font-semibold text-amber-600">Pending at counter</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Not required</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          res.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : res.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : res.status === 'Collected'
                            ? 'bg-sky-100 text-sky-800'
                            : res.status === 'Cancelled'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {res.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {res.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(res.reservation_id, 'Confirmed')}
                                disabled={actionLoadingId === res.reservation_id}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => setRejectModalRes(res)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {res.status === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(res.reservation_id, 'Collected')}
                              disabled={actionLoadingId === res.reservation_id}
                              className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Mark Dispensed
                            </button>
                          )}

                          {['Collected', 'Cancelled', 'Rejected'].includes(res.status) && (
                            <span className="text-[11px] text-slate-400 italic">Finalized</span>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Rejection Modal */}
      {rejectModalRes && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Decline Reservation Hold?</h3>
            <p className="text-xs text-slate-600">
              Decline reservation <strong>{rejectModalRes.reservation_code}</strong> for {rejectModalRes.medicine_name}. The locked stock units will be released.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Rejection *</label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Stock reserved for in-patient emergency, expired prescription..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalRes(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(rejectModalRes.reservation_id, 'Rejected', rejectReason)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PharmacyReservations;
