import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, XCircle, Clock, MapPin, Phone, Mail, Search, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const PharmacyApprovals = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPharmacies();
  }, [statusFilter]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);

      const res = await api.get(`/admin/pharmacies?${params.toString()}`);
      if (res.data.success) {
        setPharmacies(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load pharmacy approvals:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApproval = async (pharmacyId, status, reason = '') => {
    try {
      setActionLoadingId(pharmacyId);
      const res = await api.put(`/admin/pharmacies/${pharmacyId}/approval`, {
        status,
        rejection_reason: reason
      });

      if (res.data.success) {
        setRejectTarget(null);
        setRejectReason('');
        fetchPharmacies();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pharmacy Compliance & Approval Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review government license credentials, verify physical dispensaries, and manage operating permissions.
            </p>
          </div>

          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs focus:outline-hidden"
            >
              <option value="All">All Registrations</option>
              <option value="pending">Pending Verification</option>
              <option value="approved">Approved & Active</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Pharmacy & License</th>
                  <th className="py-3.5 px-4">Applicant Pharmacist</th>
                  <th className="py-3.5 px-4">Address & City</th>
                  <th className="py-3.5 px-4">Hours & Schedule</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-400">Loading pharmacy records...</td>
                  </tr>
                ) : pharmacies.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">No pharmacy records matching filter.</td>
                  </tr>
                ) : (
                  pharmacies.map((p) => (
                    <tr key={p.pharmacy_id} className="hover:bg-slate-50/70 transition-colors">
                      
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 block text-xs">{p.pharmacy_name}</span>
                        <span className="font-mono text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-sm border border-sky-200">
                          {p.license_number}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{p.owner_name}</span>
                        <span className="text-[11px] text-slate-400">✉️ {p.owner_email}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="block">{p.address}</span>
                        <span className="text-[11px] text-slate-400">{p.city} (Lat: {parseFloat(p.latitude).toFixed(4)}, Lng: {parseFloat(p.longitude).toFixed(4)})</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="block">{p.opening_hours}</span>
                        {p.is_24_hours && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            24/7 Open
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.approval_status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.approval_status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {p.approval_status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.approval_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateApproval(p.pharmacy_id, 'approved')}
                                disabled={actionLoadingId === p.pharmacy_id}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectTarget(p)}
                                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {p.approval_status === 'approved' && (
                            <button
                              onClick={() => handleUpdateApproval(p.pharmacy_id, 'rejected', 'Suspended by admin')}
                              className="px-3 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg text-xs font-bold"
                            >
                              Suspend
                            </button>
                          )}

                          {p.approval_status === 'rejected' && (
                            <button
                              onClick={() => handleUpdateApproval(p.pharmacy_id, 'approved')}
                              className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold"
                            >
                              Re-Approve
                            </button>
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

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Decline Pharmacy Registration?</h3>
            <p className="text-xs text-slate-600">
              Rejecting <strong>{rejectTarget.pharmacy_name}</strong> ({rejectTarget.license_number}) will suspend user access until valid credentials are submitted.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Rejection *</label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Expired medical premise license, invalid address verification..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateApproval(rejectTarget.pharmacy_id, 'rejected', rejectReason)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PharmacyApprovals;
