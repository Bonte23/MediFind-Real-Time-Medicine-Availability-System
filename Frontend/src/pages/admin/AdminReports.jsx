import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Building2,
  CalendarCheck,
  Pill,
  Users,
  TrendingUp
} from 'lucide-react';
import api, { BACKEND_URL } from '../../services/api';

const AdminReports = () => {
  const [inventoryReport, setInventoryReport] = useState([]);
  const [reservationReport, setReservationReport] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [invRes, resRes] = await Promise.all([
        api.get('/reports/inventory'),
        api.get('/reports/reservations')
      ]);

      if (invRes.data.success) {
        setInventoryReport(invRes.data.data);
      }
      if (resRes.data.success) {
        setReservationReport(resRes.data.data);
      }
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Executive Reports & System Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Export system-wide inventory valuations, reservation metrics, and regional stockout trends.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Sheet
            </button>
            <a
              href={`${BACKEND_URL}/api/reports/${activeTab === 'inventory' ? 'inventory' : 'reservations'}?format=csv`}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV Spreadsheet
            </a>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            System Inventory Audit ({inventoryReport.length} records)
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reservations'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All System Reservations ({reservationReport.length} records)
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'inventory' ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Pharmacy Facility</th>
                    <th className="py-3.5 px-4">Medicine Item</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Total Stock</th>
                    <th className="py-3.5 px-4">Available</th>
                    <th className="py-3.5 px-4">Unit Price</th>
                    <th className="py-3.5 px-4">Valuation</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {inventoryReport.map((i) => (
                    <tr key={i.inventory_id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{i.pharmacy_name}</td>
                      <td className="py-3.5 px-4">{i.medicine_name}</td>
                      <td className="py-3.5 px-4">{i.category}</td>
                      <td className="py-3.5 px-4 font-bold">{i.quantity}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">{i.available_units}</td>
                      <td className="py-3.5 px-4">KSh {parseFloat(i.price).toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">KSh {parseFloat(i.total_valuation).toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          i.availability_status === 'In Stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {i.availability_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Pharmacy</th>
                    <th className="py-3.5 px-4">Medicine</th>
                    <th className="py-3.5 px-4">Qty</th>
                    <th className="py-3.5 px-4">Total Price</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {reservationReport.map((r) => (
                    <tr key={r.reservation_code} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{r.reservation_code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{r.patient_name}</td>
                      <td className="py-3.5 px-4">{r.pharmacy_name}</td>
                      <td className="py-3.5 px-4 font-bold">{r.medicine_name}</td>
                      <td className="py-3.5 px-4">{r.quantity}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">KSh {parseFloat(r.total_price).toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(r.reservation_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminReports;
