import React, { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  Layers,
  Save,
  X,
  FileSpreadsheet
} from 'lucide-react';
import api, { BACKEND_URL } from '../../services/api';
import AddMedicineModal from './AddMedicineModal';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    quantity: 0,
    price: 0,
    batch_number: '',
    expiry_date: ''
  });
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, [searchTerm, statusFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);

      const res = await api.get(`/inventory/my-inventory?${params.toString()}`);
      if (res.data.success) {
        setInventory(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (e) {
      console.error('Failed to load inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.inventory_id);
    setEditForm({
      quantity: item.quantity,
      price: item.price,
      batch_number: item.batch_number || '',
      expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : ''
    });
  };

  const handleSaveEdit = async (inventoryId) => {
    try {
      setSavingId(inventoryId);
      const res = await api.put(`/inventory/${inventoryId}`, editForm);
      if (res.data.success) {
        setEditingId(null);
        fetchInventory();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update item.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (inventoryId, medicineName) => {
    if (!window.confirm(`Are you sure you want to remove "${medicineName}" from your inventory?`)) return;

    try {
      const res = await api.delete(`/inventory/${inventoryId}`);
      if (res.data.success) {
        fetchInventory();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete item.');
    }
  };

  const handleQuickRestock = async (item, addedQty) => {
    try {
      const newQty = item.quantity + addedQty;
      await api.put(`/inventory/${item.inventory_id}`, { quantity: newQty });
      fetchInventory();
    } catch (e) {
      alert(e.response?.data?.message || 'Restock failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pharmacy Inventory Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Maintain live stock levels, update pricing, track expiration dates, and prevent stockouts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={`${BACKEND_URL}/api/reports/inventory?format=csv`}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export CSV
            </a>

            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Medicine to Stock
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Items</span>
            <span className="text-xl font-black text-slate-800 block">{summary.total_items || 0}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-600">In Stock</span>
            <span className="text-xl font-black text-emerald-600 block">{summary.in_stock || 0}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-600">Low Stock</span>
            <span className="text-xl font-black text-amber-600 block">{summary.low_stock || 0}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-rose-600">Out of Stock</span>
            <span className="text-xl font-black text-rose-600 block">{summary.out_of_stock || 0}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-sky-600">Asset Value</span>
            <span className="text-xl font-black text-sky-600 block">KSh {(summary.total_valuation || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stock by medicine name, generic name, or batch number..."
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
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Inventory Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Medicine Info</th>
                  <th className="py-3.5 px-4">Physical Units</th>
                  <th className="py-3.5 px-4">Locked (Holds)</th>
                  <th className="py-3.5 px-4">Available</th>
                  <th className="py-3.5 px-4">Price (KSh)</th>
                  <th className="py-3.5 px-4">Batch / Expiry</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center text-slate-400">Loading pharmacy stock...</td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">No inventory items found.</td>
                  </tr>
                ) : (
                  inventory.map((item) => {
                    const isEditing = editingId === item.inventory_id;

                    return (
                      <tr key={item.inventory_id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Medicine */}
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-slate-900 block text-xs">{item.medicine_name}</span>
                          <span className="text-[11px] text-slate-400">{item.category} • {item.dosage_form}</span>
                        </td>

                        {/* Physical Stock */}
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              min={item.reserved_quantity}
                              value={editForm.quantity}
                              onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })}
                              className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold"
                            />
                          ) : (
                            <span className="font-bold text-slate-800">{item.quantity}</span>
                          )}
                        </td>

                        {/* Reserved Quantity */}
                        <td className="py-3.5 px-4 font-semibold text-amber-700">
                          {item.reserved_quantity}
                        </td>

                        {/* Available Stock */}
                        <td className="py-3.5 px-4">
                          <span className="font-black text-emerald-600 text-sm">
                            {item.available_stock}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.price}
                              onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                              className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold"
                            />
                          ) : (
                            <span className="font-extrabold text-slate-900">KSh {parseFloat(item.price).toFixed(2)}</span>
                          )}
                        </td>

                        {/* Batch & Expiry */}
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={editForm.batch_number}
                                onChange={(e) => setEditForm({ ...editForm, batch_number: e.target.value })}
                                className="w-24 px-2 py-1 border border-slate-300 rounded-lg text-[10px]"
                              />
                              <input
                                type="date"
                                value={editForm.expiry_date}
                                onChange={(e) => setEditForm({ ...editForm, expiry_date: e.target.value })}
                                className="w-28 px-1 py-1 border border-slate-300 rounded-lg text-[10px]"
                              />
                            </div>
                          ) : (
                            <div>
                              <span className="block text-[11px] text-slate-500 font-mono">{item.batch_number || 'N/A'}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(item.expiry_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Availability Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.availability_status === 'In Stock'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.availability_status === 'Low Stock'
                              ? 'bg-amber-100 text-amber-800'
                              : item.availability_status === 'Out of Stock'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {item.availability_status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveEdit(item.inventory_id)}
                                disabled={savingId === item.inventory_id}
                                className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                title="Save changes"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleQuickRestock(item, 10)}
                                className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold"
                                title="Quick restock +10 units"
                              >
                                +10
                              </button>
                              <button
                                onClick={() => startEdit(item)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                                title="Edit stock or price"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.inventory_id, item.medicine_name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete from inventory"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Medicine Modal */}
      <AddMedicineModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={() => fetchInventory()}
      />
    </div>
  );
};

export default InventoryManagement;
