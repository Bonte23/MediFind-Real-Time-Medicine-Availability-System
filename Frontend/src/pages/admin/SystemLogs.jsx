import React, { useState, useEffect } from 'react';
import { Clock, Shield, Search, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit-logs?limit=200');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l =>
    (l.action && l.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.full_name && l.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              System Audit Trails & Security Event Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cryptographic logging of stock alterations, login actions, reservations, and admin approvals.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4 text-sky-600" />
            Refresh Logs
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by action code, user name, or description keyword..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action Code</th>
                  <th className="py-3.5 px-4">Triggered By</th>
                  <th className="py-3.5 px-4">Event Description</th>
                  <th className="py-3.5 px-4">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-400">Loading audit trail...</td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">No logs found.</td>
                  </tr>
                ) : (
                  filteredLogs.map((l) => (
                    <tr key={l.log_id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(l.created_at).toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-sm border border-sky-200">
                          {l.action}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{l.full_name || 'System Guest'}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{l.role || 'Public'}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-800">
                        {l.description}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {l.ip_address}
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

export default SystemLogs;
