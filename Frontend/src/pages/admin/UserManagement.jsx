import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter && roleFilter !== 'All') params.append('role', roleFilter);
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, newStatus) => {
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchUsers();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Status change failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            User Accounts & Security Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage permissions, activate or suspend patient and pharmacist accounts.
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
              placeholder="Search user name, email, or phone number..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Roles</option>
              <option value="patient">Patients</option>
              <option value="pharmacist">Pharmacists</option>
              <option value="admin">Administrators</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Associated Entity</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-400">Loading user accounts...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">No users found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.user_id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 block text-xs">{u.full_name}</span>
                        <span className="text-[10px] text-slate-400">ID #{u.user_id}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="block">{u.email}</span>
                        <span className="text-[11px] text-slate-400">📞 {u.phone}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'pharmacist'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.pharmacy_name ? (
                          <span className="font-semibold text-slate-800">{u.pharmacy_name}</span>
                        ) : (
                          <span className="text-slate-400">Patient User</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.status === 'suspended'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {u.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {u.role !== 'admin' && (
                          u.status === 'active' ? (
                            <button
                              onClick={() => handleToggleStatus(u.user_id, 'suspended')}
                              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(u.user_id, 'active')}
                              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold"
                            >
                              Activate
                            </button>
                          )
                        )}
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

export default UserManagement;
