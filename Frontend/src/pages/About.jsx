import React from 'react';
import { Link } from 'react-router-dom';
import {
  Pill,
  ShieldCheck,
  Cpu,
  Database,
  Globe2,
  Server,
  Layers,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen
} from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            BIT Final-Year Capstone Project
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Design and Development of a Real-Time Medicine Availability & Pharmacy Locator System
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            An advanced software engineering initiative solving critical pharmaceutical distribution bottlenecks, medicine stockouts, and emergency search delays for patients.
          </p>
        </div>

        {/* Problem & Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-slate-900">The Problem</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Patients and caregivers frequently experience distress and wasted transit time visiting multiple physical pharmacies only to find life-saving antibiotics, chronic illness medications (insulin, hypertensive pills), or inhalers are completely out of stock.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              💡
            </div>
            <h2 className="text-lg font-bold text-slate-900">Our Solution</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              MediFind provides a centralized real-time inventory network where licensed pharmacies synchronize stock quantities, while patients query medications with Haversine distance calculation, view interactive OpenStreetMap locations, and lock reservations in advance.
            </p>
          </div>
        </div>

        {/* System Architecture Specifications */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-600" />
              Technical Stack & Architecture Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="font-bold text-sky-700 flex items-center gap-1.5">
                <Globe2 className="w-4 h-4" /> Frontend Tier
              </div>
              <p className="text-slate-600">React.js 19, Tailwind CSS, Leaflet OpenStreetMap, Axios, Chart.js.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="font-bold text-emerald-700 flex items-center gap-1.5">
                <Server className="w-4 h-4" /> Application Tier
              </div>
              <p className="text-slate-600">Node.js, Express.js REST API, JWT Authentication, Multer file uploader.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="font-bold text-indigo-700 flex items-center gap-1.5">
                <Database className="w-4 h-4" /> Database Tier
              </div>
              <p className="text-slate-600">Relational MySQL schema, MySQL Workbench compatible, 3NF normalization.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="font-bold text-purple-700 flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Security Tier
              </div>
              <p className="text-slate-600">bcrypt password hashing, Role-based Access Control (RBAC), SQL injection guards.</p>
            </div>
          </div>
        </div>

        {/* Academic Core Modules Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">System Functional Modules</h3>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-slate-800">1. Authentication & RBAC</span>
              <span className="text-slate-500">Separation of privileges across Patients, Pharmacists, and System Administrators.</span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-slate-800">2. Geo-Location Radar & Distance</span>
              <span className="text-slate-500">Haversine formula calculation computing distance from patient GPS to pharmacies.</span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-slate-800">3. Real-Time Inventory & Locking</span>
              <span className="text-slate-500">Automatic stock reservation locks preventing overbooking during active reservations.</span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-slate-800">4. Prescription Photo Verification</span>
              <span className="text-slate-500">Secure multipart upload allowing pharmacists to review physical doctor prescriptions.</span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-slate-800">5. Administrator Control & Analytics</span>
              <span className="text-slate-500">Live KPI calculation, pharmacy approval workflow, complaint resolution, and CSV reports.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
