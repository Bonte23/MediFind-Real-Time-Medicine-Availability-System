import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Clock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PharmacyProfile = () => {
  const { user, updateUser } = useAuth();
  const pharmacyId = user?.pharmacy?.pharmacy_id;

  const [formData, setFormData] = useState({
    pharmacy_name: '',
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    opening_hours: '',
    is_24_hours: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (pharmacyId) {
      fetchPharmacy();
    }
  }, [pharmacyId]);

  const fetchPharmacy = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/pharmacies/${pharmacyId}`);
      if (res.data.success) {
        const p = res.data.pharmacy;
        setFormData({
          pharmacy_name: p.pharmacy_name || '',
          address: p.address || '',
          city: p.city || '',
          latitude: p.latitude || '',
          longitude: p.longitude || '',
          phone: p.phone || '',
          email: p.email || '',
          opening_hours: p.opening_hours || '',
          is_24_hours: Boolean(p.is_24_hours)
        });
      }
    } catch (e) {
      console.error('Failed to load pharmacy profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      const res = await api.put(`/pharmacies/${pharmacyId}`, formData);
      if (res.data.success) {
        setSuccess('Pharmacy store profile updated successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pharmacy profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pharmacy Facility Profile & Map Location
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Update store name, operating hours, coordinates, and contact details shown to patients on the map.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Commercial Pharmacy Name *</label>
              <input
                type="text"
                value={formData.pharmacy_name}
                onChange={(e) => setFormData({ ...formData, pharmacy_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Region *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Latitude Coordinate</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Longitude Coordinate</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operating Schedule</label>
                <input
                  type="text"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                  placeholder="e.g. 08:00 AM - 10:00 PM"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              <label className="flex items-center gap-2 pt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_24_hours}
                  onChange={(e) => setFormData({ ...formData, is_24_hours: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded-md"
                />
                <span className="text-xs font-bold text-slate-700">Open 24/7 (Non-stop Dispensary)</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default PharmacyProfile;
