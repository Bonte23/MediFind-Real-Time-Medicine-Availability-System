import React, { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle2, XCircle, Clock, AlertCircle, User, Phone } from 'lucide-react';
import api, { BACKEND_URL } from '../../services/api';

const PrescriptionRequests = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/prescriptions');
      if (res.data.success) {
        setPrescriptions(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load prescriptions:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    if (!reviewModalItem) return;

    try {
      setSubmitting(true);
      const res = await api.put(`/prescriptions/${reviewModalItem.prescription_id}/review`, {
        status,
        pharmacist_notes: pharmacistNotes
      });

      if (res.data.success) {
        setReviewModalItem(null);
        setPharmacistNotes('');
        fetchPrescriptions();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to review prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Patient Prescription Image Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verify uploaded doctor prescriptions, provide clinical guidance, and validate dosage requirements.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading prescription documents...</div>
          ) : prescriptions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">No prescription images submitted yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {prescriptions.map((p) => (
                <div key={p.prescription_id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          Prescription #{p.prescription_id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'reviewed' || p.status === 'fulfilled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>👤 {p.patient_name}</span>
                        <span>📞 {p.patient_phone}</span>
                        <span>📅 {new Date(p.created_at).toLocaleDateString()}</span>
                      </div>

                      <p className="text-xs text-slate-600">
                        <strong>Patient Note:</strong> {p.notes || 'None'}
                      </p>

                      {p.pharmacist_notes && (
                        <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                          Pharmacist Feedback: {p.pharmacist_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={`${BACKEND_URL}${p.image_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Photo
                    </a>

                    <button
                      onClick={() => {
                        setReviewModalItem(p);
                        setPharmacistNotes(p.pharmacist_notes || '');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Review & Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Review Modal */}
      {reviewModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Review Prescription #{reviewModalItem.prescription_id}
            </h3>
            <p className="text-xs text-slate-500">
              Submitted by <strong>{reviewModalItem.patient_name}</strong> ({reviewModalItem.patient_phone})
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pharmacist Clinical Notes</label>
              <textarea
                rows="3"
                value={pharmacistNotes}
                onChange={(e) => setPharmacistNotes(e.target.value)}
                placeholder="e.g. Verified. Validated 10-day dosage. Ready for pick-up."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewModalItem(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleReview('rejected')}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl"
                >
                  Decline Rx
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleReview('reviewed')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Approve Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PrescriptionRequests;
