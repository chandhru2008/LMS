const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET; 

export const generateToken = (payload) => {
  return jwt.sign({payload}, secret, { expiresIn: '4h' });
};

export const verifyToken = (token) => {
  return jwt.verify(token, secret);
};



