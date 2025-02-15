import { getAdminByEmail } from '../repository/adminRepository.js';
import { compare } from 'bcrypt';

const login = async (email, password) => {
  const admin = await getAdminByEmail(email);
  if (!admin) throw new Error('Admin not found');

  const isPasswordValid = await compare(password, admin.password);
  if (!isPasswordValid) throw new Error('Invalid credentials');

  return admin;
};

export default { login };
