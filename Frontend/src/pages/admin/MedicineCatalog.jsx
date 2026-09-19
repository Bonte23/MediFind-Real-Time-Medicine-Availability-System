import React, { useState, useEffect } from 'react';
import { Pill, Plus, Search, Edit2, Trash2, CheckCircle2, AlertCircle, X, Save } from 'lucide-react';
import api from '../../services/api';

const MedicineCatalog = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [formData, setFormData] = useState({
    medicine_name: '',
    generic_name: '',
    category: 'Antibiotics',
    manufacturer: '',
    description: '',
    dosage_form: 'Tablet',
    strength: '',
    requires_prescription: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, [searchTerm, categoryFilter]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'All') params.append('category', categoryFilter);

      const res = await api.get(`/medicines?${params.toString()}`);
      if (res.data.success) {
        setMedicines(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load medicines:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingMed(null);
    setFormData({
      medicine_name: '',
      generic_name: '',
      category: 'Antibiotics',
      manufacturer: '',
      description: '',
      dosage_form: 'Tablet',
      strength: '',
      requires_prescription: false
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMed(med);
    setFormData({
      medicine_name: med.medicine_name,
      generic_name: med.generic_name || '',
      category: med.category,
      manufacturer: med.manufacturer,
      description: med.description || '',
      dosage_form: med.dosage_form,
      strength: med.strength || '',
      requires_prescription: Boolean(med.requires_prescription)
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      if (editingMed) {
        await api.put(`/medicines/${editingMed.medicine_id}`, formData);
      } else {
        await api.post('/medicines', formData);
      }

      setModalOpen(false);
      fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medicine.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from master catalogue?`)) return;

    try {
      await api.delete(`/medicines/${id}`);
      fetchMedicines();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Master Medicine Catalogue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Global pharmaceutical database registry available for network pharmacy inventory mapping.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Medicine
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by brand name, generic name, or manufacturer..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Brand & Generic Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Form & Strength</th>
                  <th className="py-3.5 px-4">Manufacturer</th>
                  <th className="py-3.5 px-4">Rx Required</th>
                  <th className="py-3.5 px-4">Stocking Pharmacies</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-400">Loading master registry...</td>
                  </tr>
                ) : medicines.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">No medicines found.</td>
                  </tr>
                ) : (
                  medicines.map((m) => (
                    <tr key={m.medicine_id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 block text-xs">{m.medicine_name}</span>
                        <span className="text-[11px] text-slate-400">{m.generic_name || 'N/A'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-bold text-[10px]">
                          {m.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span>{m.dosage_form} {m.strength && `(${m.strength})`}</span>
                      </td>

                      <td className="py-3.5 px-4">{m.manufacturer}</td>

                      <td className="py-3.5 px-4">
                        {m.requires_prescription ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px]">
                            Prescription
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                            OTC
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {m.pharmacies_with_stock} Pharmacies
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                            title="Edit medicine"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.medicine_id, m.medicine_name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete medicine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMed ? 'Edit Catalogue Medicine' : 'Register New Master Medicine'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={formData.medicine_name}
                  onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                  placeholder="e.g. Amoxicillin 500mg"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Generic Name</label>
                  <input
                    type="text"
                    value={formData.generic_name}
                    onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                    placeholder="e.g. Amoxicillin Trihydrate"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Antibiotics"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Pfizer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosage Form</label>
                  <select
                    value={formData.dosage_form}
                    onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Cream">Cream</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Strength</label>
                  <input
                    type="text"
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    placeholder="e.g. 500mg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Indications & Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Clinical usage and indications..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requires_prescription}
                  onChange={(e) => setFormData({ ...formData, requires_prescription: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded-md"
                />
                <span className="font-bold text-slate-700">Requires Doctor Prescription</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MedicineCatalog;
