import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Pill,
  Building2,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  Upload,
  Clock,
  Printer,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const ReserveModal = ({ isOpen, onClose, medicine, pharmacy, inventoryItem, onReservationSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [patientNotes, setPatientNotes] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!isOpen || !inventoryItem) return null;

  const availableStock = inventoryItem.available_stock !== undefined
    ? inventoryItem.available_stock
    : Math.max(0, inventoryItem.quantity - (inventoryItem.reserved_quantity || 0));

  const unitPrice = parseFloat(inventoryItem.price || 0);
  const totalPrice = Number((unitPrice * quantity).toFixed(2));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrescriptionFile(file);
      if (file.type.startsWith('image/')) {
        setPrescriptionPreview(URL.createObjectURL(file));
      } else {
        setPrescriptionPreview(null);
      }
    }
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login?redirect=reserve');
      return;
    }

    if (quantity < 1 || quantity > availableStock) {
      setError(`Quantity must be between 1 and ${availableStock}.`);
      return;
    }

    if (medicine?.requires_prescription && !prescriptionFile) {
      setError('This medication requires a valid prescription image upload.');
      return;
    }

    try {
      setLoading(true);
      let prescriptionId = null;

      // If prescription uploaded, send upload request first
      if (prescriptionFile) {
        const formData = new FormData();
        formData.append('prescription', prescriptionFile);
        formData.append('pharmacy_id', pharmacy?.pharmacy_id || inventoryItem.pharmacy_id);
        formData.append('notes', `Attached to reservation for ${medicine?.medicine_name || 'Medicine'}`);

        const uploadRes = await api.post('/prescriptions/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.data.success) {
          prescriptionId = uploadRes.data.prescription.prescription_id;
        }
      }

      // Create reservation
      const res = await api.post('/reservations', {
        inventory_id: inventoryItem.inventory_id,
        quantity: quantity,
        patient_notes: patientNotes,
        prescription_id: prescriptionId
      });

      if (res.data.success) {
        setSuccessData(res.data.reservation);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onReservationSuccess) {
          onReservationSuccess(res.data.reservation);
        }
      } else {
        setError(res.data.message || 'Failed to complete reservation.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while creating reservation.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-100">
            <Pill className="w-4 h-4" />
            Medicine Reservation Voucher
          </div>
          <h3 className="text-xl font-extrabold mt-1">
            {medicine?.medicine_name || inventoryItem.medicine_name}
          </h3>
          <p className="text-xs text-white/90 mt-0.5">
            {pharmacy?.pharmacy_name || inventoryItem.pharmacy_name}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {successData ? (
            /* Success Voucher Screen */
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-800">Reservation Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your medicine has been reserved and stock is locked.
                </p>
              </div>

              {/* Voucher Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-sky-300 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs text-slate-500 uppercase font-bold">Reservation Code</span>
                  <span className="text-base font-extrabold text-sky-700 tracking-wider font-mono">
                    {successData.reservation_code}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Medicine:</span>
                    <span className="font-bold text-slate-700">{successData.medicine_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Quantity:</span>
                    <span className="font-bold text-slate-700">{successData.quantity} Units</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Price:</span>
                    <span className="font-extrabold text-emerald-600 text-sm">${parseFloat(successData.total_price).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Hold Validity:</span>
                    <span className="font-semibold text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 24 Hours
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-600">
                  <span className="font-bold block">Pharmacy Location:</span>
                  <span>{successData.pharmacy_name || pharmacy?.pharmacy_name}, {successData.pharmacy_address || pharmacy?.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Voucher
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/patient/reservations');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 shadow-md flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-4 h-4" /> View in My Reservations
                </button>
              </div>
            </div>
          ) : (
            /* Reservation Form Screen */
            <form onSubmit={handleReserve} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Stock Details Banner */}
              <div className="bg-slate-50 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Available Units:</span>
                  <span className="text-base font-bold text-slate-800">{availableStock} in stock</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Unit Price:</span>
                  <span className="text-base font-extrabold text-sky-600">${unitPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Quantity to Reserve
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm disabled:opacity-40"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={availableStock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(availableStock, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center font-bold text-slate-800 text-sm focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                      disabled={quantity >= availableStock}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-xs text-slate-500">
                    Max: <span className="font-semibold">{availableStock}</span> units
                  </div>
                </div>
              </div>

              {/* Prescription Upload Section (if prescription required or voluntary) */}
              <div className="p-3.5 bg-sky-50/50 border border-sky-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-sky-600" />
                    Upload Prescription Image
                    {medicine?.requires_prescription && (
                      <span className="text-[10px] font-bold text-rose-500 uppercase">(Required)</span>
                    )}
                  </label>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WEBP</span>
                </div>

                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
                />

                {prescriptionPreview && (
                  <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                    <img src={prescriptionPreview} alt="Prescription Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Special Instructions / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup Notes / Instructions (Optional)
                </label>
                <textarea
                  rows="2"
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="e.g. Will pick up after 4:00 PM today..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Total Calculation & Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Est. Cost</span>
                  <span className="text-xl font-extrabold text-slate-900">${totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || availableStock === 0}
                    className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {loading ? 'Securing Stock...' : 'Confirm Reservation'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReserveModal;
