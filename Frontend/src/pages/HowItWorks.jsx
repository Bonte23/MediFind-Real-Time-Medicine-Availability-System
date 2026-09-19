import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Building2,
  ShieldCheck,
  Search,
  MapPin,
  CalendarCheck,
  Upload,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('patient'); // 'patient', 'pharmacist', 'admin'

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
            Role-Based Workflows
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How The System Works
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Select a user role below to explore the end-to-end lifecycle and interactive features.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex justify-center">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1">
            <button
              onClick={() => setActiveTab('patient')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'patient'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              Patient Workflow
            </button>

            <button
              onClick={() => setActiveTab('pharmacist')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'pharmacist'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Pharmacist Workflow
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Administrator Workflow
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'patient' && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900">Patient & Caregiver Journey</h2>
              <p className="text-xs text-slate-500 mt-1">From emergency symptom to guaranteed pharmacy pickup.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center">
                  1
                </div>
                <h3 className="font-bold text-sm text-slate-900">Search Medication</h3>
                <p className="text-xs text-slate-600">
                  Search by trade name, generic ingredient, or category. Filter by nearest distance radius or 24-hour pharmacies.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center">
                  2
                </div>
                <h3 className="font-bold text-sm text-slate-900">Compare & Inspect</h3>
                <p className="text-xs text-slate-600">
                  Compare unit prices across pharmacies, check distance, view pharmacy open hours, and inspect Leaflet map pins.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center">
                  3
                </div>
                <h3 className="font-bold text-sm text-slate-900">Upload & Reserve</h3>
                <p className="text-xs text-slate-600">
                  Attach doctor prescription photo if required, specify units, and receive a secure 24-hour reservation code.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                  4
                </div>
                <h3 className="font-bold text-sm text-slate-900">Collect at Counter</h3>
                <p className="text-xs text-slate-600">
                  Present your reservation voucher on your smartphone. Staff dispenses your reserved stock without waiting.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Link
                to="/search"
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <span>Try Medicine Search Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'pharmacist' && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900">Pharmacist & Dispensary Lifecycle</h2>
              <p className="text-xs text-slate-500 mt-1">Manage stock in real-time, process incoming reservations, and export audits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                  1
                </div>
                <h3 className="font-bold text-sm text-slate-900">Store Registration</h3>
                <p className="text-xs text-slate-600">
                  Submit pharmacy details, address, coordinates, and license number for verification by system administrator.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                  2
                </div>
                <h3 className="font-bold text-sm text-slate-900">Maintain Live Stock</h3>
                <p className="text-xs text-slate-600">
                  Add medicines, update available stock, set pricing, batch numbers, and expiry dates. Receive low-stock alerts.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                  3
                </div>
                <h3 className="font-bold text-sm text-slate-900">Review Reservations</h3>
                <p className="text-xs text-slate-600">
                  Receive notifications of patient holds. Verify attached prescription pictures and accept or decline with reason.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                  4
                </div>
                <h3 className="font-bold text-sm text-slate-900">Dispense & Report</h3>
                <p className="text-xs text-slate-600">
                  Mark reservations as collected (auto-deducting physical stock) and download CSV inventory valuation reports.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Link
                to="/register"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <span>Register Pharmacy Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900">Administrator Control Center</h2>
              <p className="text-xs text-slate-500 mt-1">Platform governance, compliance verification, and analytics monitoring.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                  1
                </div>
                <h3 className="font-bold text-sm text-slate-900">Pharmacy Approvals</h3>
                <p className="text-xs text-slate-600">
                  Inspect newly registered pharmacies, review license credentials, and approve or reject access.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                  2
                </div>
                <h3 className="font-bold text-sm text-slate-900">Catalogue Management</h3>
                <p className="text-xs text-slate-600">
                  Add, update, or deprecate drugs in the global master medicine catalogue with dosage forms and indications.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                  3
                </div>
                <h3 className="font-bold text-sm text-slate-900">User Governance</h3>
                <p className="text-xs text-slate-600">
                  Monitor patient and pharmacist accounts, suspend bad actors, and resolve customer support inquiries.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                  4
                </div>
                <h3 className="font-bold text-sm text-slate-900">System Analytics</h3>
                <p className="text-xs text-slate-600">
                  Analyze reservation volumes, stockout trends, regional demand surges, and inspect system audit trails.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HowItWorks;
