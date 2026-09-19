/**
 * Input validation helpers
 */

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && re.test(email.trim());
};

const validatePassword = (password) => {
  // Minimum 6 characters
  return typeof password === 'string' && password.length >= 6;
};

const validatePhone = (phone) => {
  return typeof phone === 'string' && phone.trim().length >= 7;
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone
};
