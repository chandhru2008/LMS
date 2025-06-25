"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticate = void 0;
const jwt_util_1 = require("../common/utils/jwt-util");
const authenticate = (request, h) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = (0, jwt_util_1.getTokenFromRequest)(request);
        if (!token) {
            throw new Error('JWT token must be provided');
        }
        const verified = (0, jwt_util_1.verifyToken)(token);
        request.auth = { credentials: verified }; // attach to request
        return h.continue;
    }
    catch (err) {
        console.error('Auth middleware error:', err === null || err === void 0 ? void 0 : err.message);
        throw new Error('Invalid or expired token');
    }
});
exports.authenticate = authenticate;
const authorizeRoles = (allowedRoles) => {
    return (request, h) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = (0, jwt_util_1.getTokenFromRequest)(request);
            if (!token) {
                return h.response({ message: 'Unauthorized' }).code(401).takeover();
            }
            const verified = (0, jwt_util_1.verifyToken)(token);
            const role = verified.payload.role;
            request.auth = { credentials: verified };
            if (!allowedRoles.includes(role)) {
                return h.response({ message: 'Forbidden: Insufficient role' }).code(403).takeover();
            }
            return h.continue;
        }
        catch (error) {
            console.error('Authorization error:', error);
            return h.response({ message: 'Authorization failed' }).code(403).takeover();
        }
    });
};
exports.authorizeRoles = authorizeRoles;
