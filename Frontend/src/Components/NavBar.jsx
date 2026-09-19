import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Pill,
  MapPin,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Building2,
  CalendarCheck,
  FileText,
  HelpCircle,
  ChevronDown,
  Upload,
  CheckCircle2,
  Clock
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-sky-700 via-sky-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
                Medi<span className="text-emerald-500">Find</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold text-slate-600 tracking-wider uppercase">
                Live Medicine & Pharmacy Radar
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/search"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/search')
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-sky-600" />
              Find Medicines
            </Link>

            <Link
              to="/locator"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/locator')
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              Pharmacy Map
            </Link>

            <Link
              to="/how-it-works"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/how-it-works')
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
              }`}
            >
              How It Works
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
              }`}
            >
              About
            </Link>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            

            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-sky-600 hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <div
                              key={n.notification_id}
                              onClick={() => {
                                markAsRead(n.notification_id);
                                if (n.link) navigate(n.link);
                                setNotifDropdownOpen(false);
                              }}
                              className={`px-4 py-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                                !n.is_read ? 'bg-sky-50/50' : ''
                              }`}
                            >
                              <div className="mt-0.5">
                                {n.type === 'reservation' ? (
                                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                                ) : n.type === 'inventory' ? (
                                  <Pill className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <Bell className="w-4 h-4 text-sky-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-slate-800 flex items-center justify-between">
                                  <span>{n.title}</span>
                                  {!n.is_read && (
                                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                  )}
                                </div>
                                <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="pt-2 px-4 border-t border-slate-100 text-center">
                        <Link
                          to={role === 'patient' ? '/patient/notifications' : role === 'pharmacist' ? '/pharmacy/dashboard' : '/admin/dashboard'}
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
                        >
                          View All Notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs">
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-xs font-bold leading-tight truncate max-w-[110px]">{user.full_name}</div>
                      <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">{role}</div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="font-bold text-xs text-slate-800">{user.full_name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                        <div className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700 capitalize">
                          {role} Portal
                        </div>
                      </div>

                      <div className="py-1">
                        {role === 'patient' && (
                          <>
                            <Link
                              to="/patient/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                            >
                              <User className="w-4 h-4 text-sky-600" /> Patient Dashboard
                            </Link>
                            <Link
                              to="/patient/reservations"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                            >
                              <CalendarCheck className="w-4 h-4 text-emerald-600" /> My Reservations
                            </Link>
                            <Link
                              to="/patient/prescriptions"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                            >
                              <Upload className="w-4 h-4 text-purple-600" /> Prescription Uploads
                            </Link>
                            <Link
                              to="/patient/profile"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                            >
                              <FileText className="w-4 h-4 text-slate-500" /> Account Profile
                            </Link>
                          </>
                        )}

                        {role === 'pharmacist' && (
                          <>
                            <Link
                              to="/pharmacy/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <Building2 className="w-4 h-4 text-emerald-600" /> Pharmacy Dashboard
                            </Link>
                            <Link
                              to="/pharmacy/inventory"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <Pill className="w-4 h-4 text-sky-600" /> Inventory Manager
                            </Link>
                            <Link
                              to="/pharmacy/reservations"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <CalendarCheck className="w-4 h-4 text-amber-600" /> Customer Reservations
                            </Link>
                            <Link
                              to="/pharmacy/reports"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <FileText className="w-4 h-4 text-indigo-600" /> Reports & Analytics
                            </Link>
                          </>
                        )}

                        {role === 'admin' && (
                          <>
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              <ShieldAlert className="w-4 h-4 text-indigo-600" /> Executive Dashboard
                            </Link>
                            <Link
                              to="/admin/pharmacies"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pharmacy Approvals
                            </Link>
                            <Link
                              to="/admin/users"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              <User className="w-4 h-4 text-sky-600" /> User Accounts
                            </Link>
                            <Link
                              to="/admin/medicines"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              <Pill className="w-4 h-4 text-amber-600" /> Medicine Registry
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-sky-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-500/25 hover:opacity-95 transition-opacity"
                >
                  Register Free
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-sky-50"
          >
            <Search className="w-4 h-4 text-sky-600" /> Find Medicines
          </Link>
          <Link
            to="/locator"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-sky-50"
          >
            <MapPin className="w-4 h-4 text-emerald-600" /> Pharmacy Map Locator
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-sky-50"
          >
            <HelpCircle className="w-4 h-4 text-purple-600" /> How It Works
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-sky-50"
          >
            <FileText className="w-4 h-4 text-slate-600" /> About Project
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase">
                Logged in as {user.full_name} ({role})
              </div>
              <Link
                to={role === 'patient' ? '/patient/dashboard' : role === 'pharmacist' ? '/pharmacy/dashboard' : '/admin/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-sky-600 bg-sky-50"
              >
                Go to {role.toUpperCase()} Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-300 font-semibold text-sm text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-sky-600 text-white font-bold text-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
