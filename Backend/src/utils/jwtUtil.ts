const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET; 

export const generateJWTToken = (payload : any) => {
  return jwt.sign({payload}, secret, { expiresIn: '4h' });
};

export const verifyToken = (token : any ) => {
  return jwt.verify(token, secret);
};



