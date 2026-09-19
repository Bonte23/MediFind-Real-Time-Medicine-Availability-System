import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Pill,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  Activity,
  FileSpreadsheet,
  Clock,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api, { BACKEND_URL } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_patients: 0,
    total_pharmacies: 0,
    pending_pharmacy_approvals: 0,
    total_medicines: 0,
    total_reservations: 0,
    confirmed_reservations: 0,
    pending_reservations: 0,
    collected_reservations: 0,
    cancelled_reservations: 0,
    out_of_stock_items: 0,
    low_stock_items: 0,
    pending_complaints: 0
  });

  const [charts, setCharts] = useState({
    top_medicines: [],
    category_distribution: [],
    monthly_trends: []
  });

  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
        setRecentLogs(res.data.recent_activity);
      }
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  // Top Medicines Chart Data
  const barChartData = {
    labels: charts.top_medicines.map(m => m.medicine_name.substring(0, 15) + '...'),
    datasets: [
      {
        label: 'Reservation Requests',
        data: charts.top_medicines.map(m => m.reservation_count),
        backgroundColor: 'rgba(2, 132, 199, 0.85)',
        borderRadius: 8
      }
    ]
  };

  // Category Distribution Doughnut Data
  const doughnutData = {
    labels: charts.category_distribution.slice(0, 5).map(c => c.category),
    datasets: [
      {
        data: charts.category_distribution.slice(0, 5).map(c => c.medicine_count),
        backgroundColor: [
          '#0284c7',
          '#059669',
          '#6366f1',
          '#f59e0b',
          '#ec4899'
        ]
      }
    ]
  };

  // Monthly Reservation Volume Line Data
  const lineChartData = {
    labels: charts.monthly_trends.map(t => t.month),
    datasets: [
      {
        label: 'Total Holds Placed',
        data: charts.monthly_trends.map(t => t.reservations),
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Successfully Collected',
        data: charts.monthly_trends.map(t => t.completed),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider border border-indigo-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              Executive System Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              System Administration & Live Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Real-time monitoring of pharmaceutical supply chains, hospital network compliance, user access governance, and audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/pharmacies"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Pending Approvals ({stats.pending_pharmacy_approvals})</span>
            </Link>
            <Link
              to="/admin/reports"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Analytics</span>
            </Link>
          </div>
        </div>

        {/* 6 Key Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total_users}</span>
            <span className="text-[11px] text-sky-600 font-semibold">{stats.total_patients} Patients</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pharmacies</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total_pharmacies}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Active & Approved</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-600">Pending Approvals</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{stats.pending_pharmacy_approvals}</span>
            <span className="text-[11px] text-slate-400 font-semibold">Awaiting License Check</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Medicine Master</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total_medicines}</span>
            <span className="text-[11px] text-indigo-600 font-semibold">Registered Drugs</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Reservations</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total_reservations}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">{stats.collected_reservations} Collected</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-rose-600">Stockout Alerts</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{stats.out_of_stock_items}</span>
            <span className="text-[11px] text-slate-400 font-semibold">{stats.low_stock_items} Low Stock</span>
          </div>

        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Monthly Trends (col-span 7) */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                Monthly Reservation & Fulfillment Velocity
              </h2>
              <span className="text-[11px] text-slate-400 font-semibold">Live DB Sync</span>
            </div>
            <div className="h-64">
              <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Category Distribution (col-span 5) */}
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              Medicine Category Breakdown
            </h2>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

        </div>

        {/* Bottom Row: Top Requested Drugs & System Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Top Medicines Bar Chart (col-span 6) */}
          <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Most Reserved Medicines (High Demand)
            </h2>
            <div className="h-64">
              <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Live System Audit Trail (col-span 6) */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                Live System Audit Trail & Security Logs
              </h2>
              <Link to="/admin/logs" className="text-xs font-bold text-sky-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {recentLogs.map((log) => (
                <div key={log.log_id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-sm">
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-800">{log.description}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      By: {log.full_name || 'System Guest'} • IP: {log.ip_address}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500 font-semibold">
                Audit logs are cryptographically timestamped and immutable.
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
