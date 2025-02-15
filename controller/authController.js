import { hash } from 'bcrypt';
import * as adminRepository from '../repository/adminRepository.js';
import { generateToken } from '../util/jwtUtil.js';
import authService from '../service/authService.js';

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await authService.login(email, password);
    const token = generateToken(admin);
    res.status(200).json({ token, admin: { id: admin.id, email: admin.email, role: admin.role } });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  // Client should handle token removal
  res.status(200).json({ message: 'Logged out successfully' });
};

const createAdmin = async (req, res, next) => {
  try {
    // Only superadmin can create new admins
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { email, password, role = 'admin' } = req.body;
    const hashedPassword = await hash(password, 10);
    const admin = await adminRepository.createAdmin({ email, password: hashedPassword, role });
    res.status(201).json(admin);
  } catch (error) {
    next(error);
  }
};

const deleteAdmin = async (req, res, next) => {
  try {
    // Only superadmin can delete admins
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { id } = req.params;
    const deleted = await adminRepository.deleteAdmin(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Admin not found or cannot be deleted' });
    }
    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getAllAdmins = async (req, res, next) => {
  try {
    // Only superadmin can view all admins
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const admins = await adminRepository.getAllAdmins();
    res.status(200).json(admins);
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  logout,
  createAdmin,
  deleteAdmin,
  getAllAdmins
};
