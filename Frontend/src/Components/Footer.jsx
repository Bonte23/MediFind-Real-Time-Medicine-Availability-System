import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, ShieldCheck, HeartPulse, PhoneCall, ExternalLink, MapPin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-teal-400 to-emerald-400 flex items-center justify-center text-white shadow-md">
                <Pill className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Medi<span className="text-emerald-400">Find</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Design and Development of a Real-Time Medicine Availability and Pharmacy Locator System. 
              Bridging the gap between patients, localized pharmacies, and emergency pharmaceutical stock.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Live System Operational
              </div>
              <span className="text-xs text-slate-500">BIT Capstone Project</span>
            </div>
          </div>

          {/* Col 2: Patient Services */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-3">Patients</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/search" className="hover:text-emerald-400 transition-colors">
                  Search Medicine Stock
                </Link>
              </li>
              <li>
                <Link to="/locator" className="hover:text-emerald-400 transition-colors">
                  Pharmacy Map Locator
                </Link>
              </li>
              <li>
                <Link to="/patient/prescriptions" className="hover:text-emerald-400 transition-colors">
                  Prescription Upload
                </Link>
              </li>
              <li>
                <Link to="/patient/reservations" className="hover:text-emerald-400 transition-colors">
                  Medicine Reservations
                </Link>
              </li>
              <li>
                <Link to="/patient/complaints" className="hover:text-emerald-400 transition-colors">
                  Feedback & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Pharmacy Services */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-3">Pharmacies</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">
                  Register Pharmacy
                </Link>
              </li>
              <li>
                <Link to="/pharmacy/inventory" className="hover:text-emerald-400 transition-colors">
                  Inventory Management
                </Link>
              </li>
              <li>
                <Link to="/pharmacy/reservations" className="hover:text-emerald-400 transition-colors">
                  Incoming Reservations
                </Link>
              </li>
              <li>
                <Link to="/pharmacy/reports" className="hover:text-emerald-400 transition-colors">
                  Stock Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency & Contact */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-3">Emergency Support</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 Helpline: 1-800-MEDIFIND</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>support@medifind.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Metropolitan Healthcare Network</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} MediFind System. Bachelor of Information Technology Final-Year Project.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-300">System Architecture</Link>
            <Link to="/how-it-works" className="hover:text-slate-300">User Workflow</Link>
            <Link to="/contact" className="hover:text-slate-300">Contact Team</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
