import React, { useState, useEffect } from 'react';
import { CalendarCheck, Search, Filter, CheckCircle2, Clock, Ban, XCircle, FileSpreadsheet } from 'lucide-react';
import api, { BACKEND_URL } from '../../services/api';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              System-Wide Reservation Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comprehensive audit log of all patient medicine holds placed across registered pharmacies.
            </p>
          </div>

          <a
            href={`${BACKEND_URL}/api/reports/reservations?format=csv`}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-sky-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-600" />
            Export CSV
          </a>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code, patient, or medicine..."
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
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Collected">Collected</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Reservation Code</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Dispensary (Pharmacy)</th>
                  <th className="py-3.5 px-4">Medicine Item</th>
                  <th className="py-3.5 px-4">Quantity & Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-400">Loading reservation audits...</td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">No reservations found.</td>
                  </tr>
                ) : (
                  reservations.map((r) => (
                    <tr key={r.reservation_id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 block w-fit">
                          {r.reservation_code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{r.patient_name}</span>
                        <span className="text-[10px] text-slate-400">{r.patient_email}</span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {r.pharmacy_name}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{r.medicine_name}</span>
                        <span className="text-[11px] text-slate-400">{r.dosage_form}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold">{r.quantity} Units</span>
                        <span className="text-emerald-600 font-extrabold block">KSh {parseFloat(r.total_price).toFixed(2)}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'Collected'
                            ? 'bg-sky-100 text-sky-800'
                            : r.status === 'Cancelled'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminReservations;
