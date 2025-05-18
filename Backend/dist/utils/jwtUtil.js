"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateJWTToken = void 0;
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const generateJWTToken = (payload) => {
    console.log("oii ribio iu i uhi yu gyu yu  ");
    return jwt.sign({ payload }, secret, { expiresIn: '4h' });
};
exports.generateJWTToken = generateJWTToken;
const verifyToken = (token) => {
    return jwt.verify(token, secret);
};
exports.verifyToken = verifyToken;
