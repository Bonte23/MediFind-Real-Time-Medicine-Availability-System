import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';
import api, { BACKEND_URL } from '../../services/api';

const PrescriptionUpload = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pharmacyId, setPharmacyId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prescRes, pharmRes] = await Promise.all([
        api.get('/prescriptions'),
        api.get('/pharmacies')
      ]);

      if (prescRes.data.success) {
        setPrescriptions(prescRes.data.data);
      }
      if (pharmRes.data.success) {
        setPharmacies(pharmRes.data.data);
      }
    } catch (e) {
      console.error('Failed to load prescription data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedFile) {
      setError('Please choose a prescription picture (JPG, PNG, WEBP, or PDF).');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('prescription', selectedFile);
      if (pharmacyId) formData.append('pharmacy_id', pharmacyId);
      if (notes) formData.append('notes', notes);

      const res = await api.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSuccessMessage('Prescription uploaded successfully. A pharmacist will review it.');
        setSelectedFile(null);
        setPreviewUrl(null);
        setPharmacyId('');
        setNotes('');
        fetchData();
      } else {
        setError(res.data.message || 'Upload failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during file upload.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'reviewed':
      case 'fulfilled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed & Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Pharmacist Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Prescription Picture Upload & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Upload digital photos of doctor prescription slips for pharmacist verification and medicine dispensing.
          </p>
        </div>

        {/* Top Grid: Upload Form + Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Upload Card (col-span 7) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-sky-600" />
              Upload New Prescription Document
            </h2>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-sky-300 rounded-3xl p-6 text-center hover:bg-sky-50/50 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Click to browse or drag & drop prescription image'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Supported formats: PNG, JPG, JPEG, WEBP, or PDF (Max 8MB)
                  </p>
                </div>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Image Preview Attached</span>
                    <span className="text-slate-500">{selectedFile?.name}</span>
                  </div>
                </div>
              )}

              {/* Target Pharmacy (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designate Target Pharmacy (Optional)
                </label>
                <select
                  value={pharmacyId}
                  onChange={(e) => setPharmacyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white focus:outline-hidden"
                >
                  <option value="">Any Available Network Pharmacy</option>
                  {pharmacies.map(p => (
                    <option key={p.pharmacy_id} value={p.pharmacy_id}>
                      {p.pharmacy_name} ({p.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor / Patient Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prescription Details / Notes for Pharmacist
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Prescribed by Dr. Smith for 7 days course of antibiotics..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? 'Uploading Prescription...' : 'Submit Prescription for Verification'}
              </button>
            </form>
          </div>

          {/* Right: Guidelines Card (col-span 5) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Prescription Photo Guidelines
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span><strong>Clear Doctor Signature:</strong> Ensure doctor's name, clinic stamp, and signature are legibly captured.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span><strong>Visible Date:</strong> Prescriptions older than valid clinical limits cannot be dispensed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span><strong>Dosage & Quantity:</strong> Make sure the exact milligram strength and dosage intervals are clearly readable.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Previously Uploaded Prescriptions Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">
              My Prescription Upload History ({prescriptions.length})
            </h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading prescription records...</div>
          ) : prescriptions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No prescriptions uploaded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {prescriptions.map((p) => (
                <div key={p.prescription_id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Prescription #{p.prescription_id}</span>
                        {getStatusBadge(p.status)}
                      </div>
                      <p className="text-xs text-slate-600">{p.notes || 'No patient notes provided.'}</p>
                      {p.pharmacist_notes && (
                        <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                          Pharmacist Feedback: {p.pharmacist_notes}
                        </p>
                      )}
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>Uploaded: {new Date(p.created_at).toLocaleDateString()}</span>
                        {p.pharmacy_name && <span>Assigned: {p.pharmacy_name}</span>}
                      </div>
                    </div>
                  </div>

                  <a
                    href={`${BACKEND_URL}${p.image_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-center"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View File
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PrescriptionUpload;
