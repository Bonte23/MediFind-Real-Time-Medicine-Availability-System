import React from 'react';
import { Bell, CalendarCheck, Pill, CheckCircle2, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const PatientNotifications = () => {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Notifications & Alerts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live updates on reservation confirmations, medicine restocks, and support inquiries.
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-white border border-slate-200 text-sky-600 hover:bg-sky-50 text-xs font-bold rounded-xl shadow-2xs"
          >
            Mark All Read
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">No notifications yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n.notification_id}
                  onClick={() => {
                    markAsRead(n.notification_id);
                    if (n.link) navigate(n.link);
                  }}
                  className={`p-5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-4 ${
                    !n.is_read ? 'bg-sky-50/60' : ''
                  }`}
                >
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-sky-600 shrink-0">
                    {n.type === 'reservation' ? (
                      <CalendarCheck className="w-5 h-5 text-emerald-600" />
                    ) : n.type === 'inventory' ? (
                      <Pill className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Bell className="w-5 h-5 text-sky-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-slate-900">{n.title}</h3>
                      <span className="text-[11px] text-slate-400">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PatientNotifications;
