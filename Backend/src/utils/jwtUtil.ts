const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET; 

export const generateJWTToken = (payload : any) => {
  console.log("oii ribio iu i uhi yu gyu yu  ")
  return jwt.sign({payload}, secret, { expiresIn: '4h' });
};

export const verifyToken = (token : any ) => {
  return jwt.verify(token, secret);
};



