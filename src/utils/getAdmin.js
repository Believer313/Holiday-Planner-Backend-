const User = require('../models/User');

const getAllAdminEmails = async () => {
  try {
    const admins = await User.find({ role: 'admin' }).select('email phone');
    return admins;
  } catch (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
};

const getAdminEmails = async () => {
  const admins = await getAllAdminEmails();
  return admins.map(admin => admin.email).filter(Boolean);
};

const getAdminPhones = async () => {
  const admins = await getAllAdminEmails();
  return admins.map(admin => admin.phone).filter(Boolean);
};

module.exports = {
  getAllAdminEmails,
  getAdminEmails,
  getAdminPhones
};