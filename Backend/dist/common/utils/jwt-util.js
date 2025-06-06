"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateJWTToken = void 0;
exports.getTokenFromRequest = getTokenFromRequest;
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const generateJWTToken = (payload) => {
    return jwt.sign({ payload }, secret, { expiresIn: '4h' });
};
exports.generateJWTToken = generateJWTToken;
const verifyToken = (token) => {
    return jwt.verify(token, secret);
};
exports.verifyToken = verifyToken;
function getTokenFromRequest(request) {
    var _a;
    return ((_a = request.state.userSession) === null || _a === void 0 ? void 0 : _a.token) || null;
}
