const jwt = require('jsonwebtoken');
import { Request } from "@hapi/hapi";
import { Employee } from '../../modules/empolyee/employee-entity'
const secret = process.env.JWT_SECRET;

export const generateJWTToken = (payload: Employee) => {
  return jwt.sign({ payload }, secret, { expiresIn: '4h' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, secret);
};


export function getTokenFromRequest(request: Request): string | null {
  return request.state.userSession?.token || null;
}

