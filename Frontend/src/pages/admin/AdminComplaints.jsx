import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle2, Clock, Reply, AlertCircle, User } from 'lucide-react';
import api from '../../services/api';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseModalItem, setResponseModalItem] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load complaints:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!responseModalItem || !adminResponse.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.put(`/complaints/${responseModalItem.complaint_id}/respond`, {
        admin_response: adminResponse.trim(),
        status: 'resolved'
      });

      if (res.data.success) {
        setResponseModalItem(null);
        setAdminResponse('');
        fetchComplaints();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit response.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Customer Support & Feedback Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Resolve patient inquiries, stock inaccuracy reports, and dispensary feedback.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading support tickets...</div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No complaints filed.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <div key={c.complaint_id} className="p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">{c.subject}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>👤 Submitter: {c.user_name} ({c.user_email})</span>
                    {c.pharmacy_name && <span>🏢 Target Pharmacy: {c.pharmacy_name}</span>}
                  </div>

                  {c.admin_response ? (
                    <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl text-xs space-y-1">
                      <span className="font-bold text-sky-800 block text-[11px]">Official Administrator Resolution:</span>
                      <p className="text-slate-700">{c.admin_response}</p>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setResponseModalItem(c);
                          setAdminResponse('');
                        }}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        Reply & Resolve Ticket
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Response Modal */}
      {responseModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Respond to: {responseModalItem.subject}
            </h3>
            <p className="text-xs text-slate-500">
              Submitted by <strong>{responseModalItem.user_name}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Resolution Response *</label>
              <textarea
                rows="4"
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Explain resolution, disciplinary action, or guidance..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResponseModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !adminResponse.trim()}
                onClick={handleSendResponse}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send & Mark Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminComplaints;
