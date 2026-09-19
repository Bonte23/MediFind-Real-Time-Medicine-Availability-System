const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../config/jwt');
const { validateEmail, validatePassword } = require('../middleware/validate');
const { logAudit } = require('../utils/logger');

/**
 * Register a new Patient or Pharmacist
 */
exports.register = async (req, res, next) => {
  try {
    const {
      full_name,
      email,
      phone,
      password,
      role = 'patient',
      address,
      latitude,
      longitude,
      // Pharmacy fields if role === 'pharmacist'
      pharmacy_name,
      license_number,
      pharmacy_address,
      pharmacy_city,
      pharmacy_phone,
      pharmacy_email,
      opening_hours,
      is_24_hours
    } = req.body;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, phone number, and password.'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (!['patient', 'pharmacist'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selected. Only patient or pharmacist registration is permitted.'
      });
    }

    // Check if email already registered
    const existingUser = await db.queryOne('SELECT user_id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Pharmacist specific validations
    if (role === 'pharmacist') {
      if (!pharmacy_name || !license_number || !pharmacy_address) {
        return res.status(400).json({
          success: false,
          message: 'Please provide pharmacy name, government license number, and physical address.'
        });
      }

      const existingLicense = await db.queryOne('SELECT pharmacy_id FROM pharmacies WHERE license_number = ?', [license_number.trim()]);
      if (existingLicense) {
        return res.status(409).json({
          success: false,
          message: 'A pharmacy with this license number is already registered.'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Initial status: pharmacist is pending admin approval, patient is active
    const userStatus = role === 'pharmacist' ? 'pending' : 'active';

    const userResult = await db.execute(
      `INSERT INTO users (full_name, email, phone, password, role, status, address, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name.trim(),
        email.toLowerCase().trim(),
        phone.trim(),
        hashedPassword,
        role,
        userStatus,
        address || pharmacy_address || null,
        latitude ? parseFloat(latitude) : (role === 'pharmacist' ? 40.7128 : null),
        longitude ? parseFloat(longitude) : (role === 'pharmacist' ? -74.0060 : null)
      ]
    );

    const userId = userResult.insertId;
    let pharmacyId = null;

    if (role === 'pharmacist') {
      const pharmResult = await db.execute(
        `INSERT INTO pharmacies 
         (user_id, pharmacy_name, license_number, address, city, latitude, longitude, phone, email, opening_hours, is_24_hours, approval_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          userId,
          pharmacy_name.trim(),
          license_number.trim(),
          pharmacy_address.trim(),
          pharmacy_city || 'New York',
          latitude ? parseFloat(latitude) : 0,
          longitude ? parseFloat(longitude) : 0,
          pharmacy_phone || phone,
          pharmacy_email || email,
          opening_hours || '08:00 AM - 10:00 PM',
          is_24_hours ? 1 : 0
        ]
      );
      pharmacyId = pharmResult.insertId;

      // Notify admin
      const adminUsers = await db.query("SELECT user_id FROM users WHERE role = 'admin'");
      for (const admin of adminUsers) {
        await db.execute(
          'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
          [
            admin.user_id,
            'New Pharmacy Registration',
            `${pharmacy_name} (${license_number}) registered and requires administrator approval.`,
            'approval',
            '/admin/pharmacies'
          ]
        );
      }
    }

    await logAudit(userId, 'USER_REGISTER', `New ${role} registered: ${email}`);

    // If pharmacist, let them know account is pending admin approval
    if (role === 'pharmacist') {
      return res.status(201).json({
        success: true,
        message: 'Pharmacy registration submitted successfully! Your account is awaiting administrator verification before activation.',
        data: {
          user_id: userId,
          role,
          status: 'pending'
        }
      });
    }

    // Generate token for instant patient login
    const token = generateToken({
      id: userId,
      email: email.toLowerCase().trim(),
      role: 'patient',
      full_name: full_name.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        user_id: userId,
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        role: 'patient',
        status: 'active',
        address: address || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Login (Patient, Pharmacist, Admin)
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = await db.queryOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the administrator. Please contact support.'
      });
    }

    let pharmacy = null;
    if (user.role === 'pharmacist') {
      pharmacy = await db.queryOne('SELECT * FROM pharmacies WHERE user_id = ?', [user.user_id]);
      
      if (pharmacy && pharmacy.approval_status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Pharmacy registration is currently awaiting administrator approval. You will receive access once verified.'
        });
      }

      if (pharmacy && pharmacy.approval_status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: `Pharmacy registration was not approved. Reason: ${pharmacy.rejection_reason || 'Compliance verification issue.'}`
        });
      }
    }

    // Generate Token
    const tokenPayload = {
      id: user.user_id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      pharmacy_id: pharmacy ? pharmacy.pharmacy_id : null
    };

    const token = generateToken(tokenPayload);

    await logAudit(user.user_id, 'USER_LOGIN', `User logged in from ${req.ip || '127.0.0.1'}`);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        pharmacy: pharmacy ? {
          pharmacy_id: pharmacy.pharmacy_id,
          pharmacy_name: pharmacy.pharmacy_name,
          license_number: pharmacy.license_number,
          address: pharmacy.address,
          city: pharmacy.city,
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
          approval_status: pharmacy.approval_status,
          is_24_hours: !!pharmacy.is_24_hours
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User Profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await db.queryOne(
      'SELECT user_id, full_name, email, phone, role, status, address, latitude, longitude, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    let pharmacy = null;
    if (user.role === 'pharmacist') {
      pharmacy = await db.queryOne('SELECT * FROM pharmacies WHERE user_id = ?', [user.user_id]);
    }

    res.json({
      success: true,
      user: {
        ...user,
        pharmacy
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, address, latitude, longitude } = req.body;

    await db.execute(
      `UPDATE users 
       SET full_name = COALESCE(?, full_name),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           latitude = COALESCE(?, latitude),
           longitude = COALESCE(?, longitude)
       WHERE user_id = ?`,
      [full_name, phone, address, latitude ? parseFloat(latitude) : null, longitude ? parseFloat(longitude) : null, req.user.user_id]
    );

    const updated = await db.queryOne(
      'SELECT user_id, full_name, email, phone, role, status, address, latitude, longitude FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.'
      });
    }

    if (!validatePassword(new_password)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await db.queryOne('SELECT password FROM users WHERE user_id = ?', [req.user.user_id]);
    const isMatch = await bcrypt.compare(current_password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await db.execute('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, req.user.user_id]);

    await logAudit(req.user.user_id, 'PASSWORD_CHANGE', 'User updated account password');

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};
