import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextDefinition';
import api from '../services/api';


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
    hasLocation: false,
    loadingLocation: false,
    error: null
  });

  // Load stored auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('medifind_token');
    const savedUser = localStorage.getItem('medifind_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('medifind_token');
        localStorage.removeItem('medifind_user');
      }
    }
    setLoading(false);

    // Prompt for browser geolocation if permitted
    requestUserLocation();
  }, []);

  const requestUserLocation = () => {
    if (!('geolocation' in navigator)) {
      setUserLocation({
        latitude: null,
        longitude: null,
        hasLocation: false,
        loadingLocation: false,
        error: 'Geolocation is not supported by this browser.'
      });
      return;
    }
  
    setUserLocation(prev => ({
      ...prev,
      loadingLocation: true,
      error: null
    }));
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          hasLocation: true,
          loadingLocation: false,
          error: null
        });
      },
      (error) => {
        let errorMessage =
          'Unable to determine your location. You can still search for pharmacies.';
  
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage =
            'Location access denied. You can still search for pharmacies.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out. Please try again.';
        }
  
        setUserLocation({
          latitude: null,
          longitude: null,
          hasLocation: false,
          loadingLocation: false,
          error: errorMessage
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: jwtToken, user: userData } = res.data;
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('medifind_token', jwtToken);
        localStorage.setItem('medifind_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        // If patient, token is returned directly
        if (res.data.token) {
          const { token: jwtToken, user: userData } = res.data;
          setToken(jwtToken);
          setUser(userData);
          localStorage.setItem('medifind_token', jwtToken);
          localStorage.setItem('medifind_user', JSON.stringify(userData));
        }
        return { success: true, message: res.data.message, data: res.data };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('medifind_token');
    localStorage.removeItem('medifind_user');
  };

  const updateUser = (userData) => {
    setUser(prev => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('medifind_user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        updateUser(res.data.user);
      }
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        role: user?.role || 'guest',
        userLocation,
        requestUserLocation,
        login,
        register,
        logout,
        updateUser,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

