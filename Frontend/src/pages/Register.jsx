import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Pill,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  MapPin,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [roleTab, setRoleTab] = useState('patient'); // 'patient' or 'pharmacist'

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    address: '',
    // Pharmacist specific
    pharmacy_name: '',
    license_number: '',
    pharmacy_address: '',
    pharmacy_city: 'New York',
    opening_hours: '08:00 AM - 10:00 PM',
    is_24_hours: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        role: roleTab
      };

      const res = await register(payload);
      if (res.success) {
        if (roleTab === 'patient') {
          navigate('/patient/dashboard');
        } else {
          setSuccessMessage(
            res.message || 'Pharmacy registration submitted! Your account is awaiting administrator approval before activation.'
          );
        }
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        
        {/* Brand */}
        <Link to="/" className="inline-flex items-center gap-2 group mb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
            <Pill className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-sky-700 to-teal-600 bg-clip-text text-transparent tracking-tight">
            Medi<span className="text-emerald-500">Find</span>
          </span>
        </Link>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Create Your Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Join the real-time medicine locator and pharmacy network.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        
        {/* Role Tab Selector */}
        <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs flex items-center mb-4">
          <button
            type="button"
            onClick={() => setRoleTab('patient')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              roleTab === 'patient'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            Patient / General User
          </button>
          <button
            type="button"
            onClick={() => setRoleTab('pharmacist')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              roleTab === 'pharmacist'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Pharmacy / Pharmacist
          </button>
        </div>

        {/* Card Form */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-900/5 rounded-3xl border border-slate-200/80">
          
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Registration Submitted!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {successMessage}
              </p>
              <Link
                to="/login"
                className="inline-block px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl"
              >
                Proceed to Login Page
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {roleTab === 'pharmacist' ? 'Licensed Pharmacist Full Name' : 'Patient Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john@example.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +1-212-555-0199"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pharmacist Specific Fields */}
              {roleTab === 'pharmacist' && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 border-b border-emerald-200/60 pb-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Pharmacy Facility Details
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pharmacy Commercial Name
                    </label>
                    <input
                      type="text"
                      name="pharmacy_name"
                      value={formData.pharmacy_name}
                      onChange={handleChange}
                      placeholder="e.g. CityCare Central Pharmacy"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required={roleTab === 'pharmacist'}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Government License No.
                      </label>
                      <input
                        type="text"
                        name="license_number"
                        value={formData.license_number}
                        onChange={handleChange}
                        placeholder="e.g. PHARM-NY-2024-998"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        required={roleTab === 'pharmacist'}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Operating Hours
                      </label>
                      <input
                        type="text"
                        name="opening_hours"
                        value={formData.opening_hours}
                        onChange={handleChange}
                        placeholder="e.g. 08:00 AM - 10:00 PM"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Physical Street Address
                    </label>
                    <input
                      type="text"
                      name="pharmacy_address"
                      value={formData.pharmacy_address}
                      onChange={handleChange}
                      placeholder="e.g. 45 Broadway, Financial District"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required={roleTab === 'pharmacist'}
                    />
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_24_hours"
                      checked={formData.is_24_hours}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Open 24 Hours (Round the Clock)</span>
                  </label>
                </div>
              )}

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters..."
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="Repeat password..."
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 ${
                  roleTab === 'pharmacist'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/25'
                    : 'bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 shadow-sky-600/25'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create {roleTab === 'pharmacist' ? 'Pharmacy' : 'Patient'} Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-sky-600 hover:underline">
              Sign In Here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Register;
