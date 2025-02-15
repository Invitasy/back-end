import jwt from 'jsonwebtoken';
import { secret, expiresIn } from '../config/jwtConfig.js';

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    }, 
    secret, 
    { expiresIn }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};