import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, CheckCircle2, Send, Clock, Building2 } from 'lucide-react';
import api from '../../services/api';

const PatientComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [pharmacyId, setPharmacyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, pharmRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/pharmacies')
      ]);

      if (compRes.data.success) {
        setComplaints(compRes.data.data);
      }
      if (pharmRes.data.success) {
        setPharmacies(pharmRes.data.data);
      }
    } catch (e) {
      console.error('Failed to load complaints:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!subject || !description) {
      setError('Please provide both subject and description.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/complaints', {
        subject,
        description,
        pharmacy_id: pharmacyId || null
      });

      if (res.data.success) {
        setSuccess('Inquiry submitted! Admin will investigate and respond.');
        setSubject('');
        setDescription('');
        setPharmacyId('');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Patient Feedback & Support Complaints
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Submit service discrepancies or questions directly to system administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Submission Form (col-span 5) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-600" />
              New Inquiry or Complaint
            </h2>

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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Stock discrepancy at CityCare Central..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Associated Pharmacy (Optional)
                </label>
                <select
                  value={pharmacyId}
                  onChange={(e) => setPharmacyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white focus:outline-hidden"
                >
                  <option value="">None / General System Issue</option>
                  {pharmacies.map(p => (
                    <option key={p.pharmacy_id} value={p.pharmacy_id}>
                      {p.pharmacy_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Evidence</label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete details regarding the situation..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Submit Support Ticket'}
              </button>
            </form>
          </div>

          {/* Complaints History (col-span 7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                My Support Tickets ({complaints.length})
              </h3>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading support tickets...</div>
            ) : complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No complaints or inquiries filed.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <div key={c.complaint_id} className="p-5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{c.subject}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed">{c.description}</p>

                    {c.admin_response ? (
                      <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl space-y-1">
                        <span className="font-bold text-sky-800 block text-[11px]">Administrator Response:</span>
                        <p className="text-slate-700">{c.admin_response}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px] block">
                        Awaiting administrator review.
                      </span>
                    )}

                    <div className="pt-1 text-[10px] text-slate-400 flex items-center gap-3">
                      <span>Submitted: {new Date(c.created_at).toLocaleString()}</span>
                      {c.pharmacy_name && <span>Pharmacy: {c.pharmacy_name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default PatientComplaints;
