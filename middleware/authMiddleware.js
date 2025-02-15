import pkg from 'jsonwebtoken';
const { verify } = pkg;
import { secret } from '../config/jwtConfig.js';

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

export default authenticate;