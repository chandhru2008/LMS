const jwt = require('jsonwebtoken');
import { Request } from "@hapi/hapi";
const secret = process.env.JWT_SECRET;

export const generateJWTToken = (payload: any) => {
  return jwt.sign({ payload }, secret, { expiresIn: '4h' });
};

export const verifyToken = (token: any) => {
  return jwt.verify(token, secret);
};


export function getTokenFromRequest(request: Request): string | null {
  return request.state.userSession?.token || null;
}

