import React, { useState, useEffect } from 'react';
import { X, Pill, Plus, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const AddMedicineModal = ({ isOpen, onClose, onAdded }) => {
  const [catalogMedicines, setCatalogMedicines] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [isCreatingNewMed, setIsCreatingNewMed] = useState(false);

  // New master catalog fields
  const [newMedData, setNewMedData] = useState({
    medicine_name: '',
    generic_name: '',
    category: 'Antibiotics',
    manufacturer: '',
    description: '',
    dosage_form: 'Tablet',
    strength: '',
    requires_prescription: false
  });

  // Inventory fields
  const [quantity, setQuantity] = useState(20);
  const [price, setPrice] = useState(10.00);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCatalog();
    }
  }, [isOpen]);

  const fetchCatalog = async () => {
    try {
      const res = await api.get('/medicines');
      if (res.data.success) {
        setCatalogMedicines(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedMedId(res.data.data[0].medicine_id);
        }
      }
    } catch (e) {
      console.error('Failed to load catalogue:', e);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let finalMedId = selectedMedId;

    try {
      setLoading(true);

      // If pharmacist requested registering a new medicine into catalogue
      if (isCreatingNewMed) {
        if (!newMedData.medicine_name || !newMedData.category || !newMedData.manufacturer) {
          setError('Please fill all required new medicine fields.');
          setLoading(false);
          return;
        }

        const createRes = await api.post('/medicines', newMedData);
        if (createRes.data.success) {
          finalMedId = createRes.data.medicine.medicine_id;
        } else {
          setError(createRes.data.message || 'Failed to create medicine.');
          setLoading(false);
          return;
        }
      }

      // Add to inventory
      const invRes = await api.post('/inventory', {
        medicine_id: finalMedId,
        quantity: parseInt(quantity, 10),
        price: parseFloat(price),
        batch_number: batchNumber || `BATCH-${Date.now().toString().slice(-4)}`,
        expiry_date: expiryDate
      });

      if (invRes.data.success) {
        if (onAdded) onAdded();
        onClose();
      } else {
        setError(invRes.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item to inventory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-100">
            <Pill className="w-4 h-4" />
            Inventory Acquisition
          </div>
          <h3 className="text-xl font-extrabold mt-1">Add Medicine to Pharmacy Stock</h3>
        </div>

        {/* Content Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Toggle between existing catalogue or register new */}
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-2">
              <span className="text-slate-700">Select Medicine Source</span>
              <button
                type="button"
                onClick={() => setIsCreatingNewMed(!isCreatingNewMed)}
                className="text-emerald-600 hover:underline"
              >
                {isCreatingNewMed ? '← Choose Existing Catalogue Drug' : '+ Register New Drug to Catalogue'}
              </button>
            </div>

            {isCreatingNewMed ? (
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Medicine Brand Name *</label>
                  <input
                    type="text"
                    value={newMedData.medicine_name}
                    onChange={(e) => setNewMedData({ ...newMedData, medicine_name: e.target.value })}
                    placeholder="e.g. Augmentin 625mg"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <input
                      type="text"
                      value={newMedData.category}
                      onChange={(e) => setNewMedData({ ...newMedData, category: e.target.value })}
                      placeholder="e.g. Antibiotics"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dosage Form</label>
                    <select
                      value={newMedData.dosage_form}
                      onChange={(e) => setNewMedData({ ...newMedData, dosage_form: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Cream">Cream</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Manufacturer *</label>
                    <input
                      type="text"
                      value={newMedData.manufacturer}
                      onChange={(e) => setNewMedData({ ...newMedData, manufacturer: e.target.value })}
                      placeholder="e.g. GSK"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Strength</label>
                    <input
                      type="text"
                      value={newMedData.strength}
                      onChange={(e) => setNewMedData({ ...newMedData, strength: e.target.value })}
                      placeholder="e.g. 500mg"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMedData.requires_prescription}
                    onChange={(e) => setNewMedData({ ...newMedData, requires_prescription: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-md"
                  />
                  <span className="font-bold text-slate-700">Requires Doctor Prescription</span>
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Medicine from Global Catalogue
                </label>
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden"
                >
                  {catalogMedicines.map((m) => (
                    <option key={m.medicine_id} value={m.medicine_id}>
                      {m.medicine_name} ({m.category} - {m.dosage_form})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Inventory Pricing & Quantity Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Stock Units (Quantity) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Unit Retail Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. BATCH-2024-X"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {loading ? 'Adding Stock...' : 'Save to Inventory'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AddMedicineModal;
