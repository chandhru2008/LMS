import { Request, ResponseToolkit } from '@hapi/hapi';
import { getTokenFromRequest, verifyToken } from '../utils/jwtUtil';

export const authenticate = async (request: Request, h: ResponseToolkit) => {
    try {
        const token = getTokenFromRequest(request);

        console.log("Token : ", token)



        if (!token) {
            throw new Error('JWT token must be provided');
        }

        const verified = verifyToken(token);

        (request as any).auth = { credentials: verified }; // attach to request
        return h.continue;
    } catch (err) {
        console.error('Auth middleware error:', err?.message);
        throw new Error('Invalid or expired token');
    }
};


export const authorizeRoles = (allowedRoles: string[]) => {
    return async (request: Request, h: ResponseToolkit) => {
        try {
            const token = getTokenFromRequest(request);
            if (!token) {
                return h.response({ message: 'Unauthorized' }).code(401).takeover();
            }

            const verified = verifyToken(token);

            const role = verified.payload.role;
            (request as any).auth = { credentials: verified };
            if (!allowedRoles.includes(role)) {
                return h.response({ message: 'Forbidden: Insufficient role' }).code(403).takeover();
            }

            return h.continue;
        } catch (error) {
            console.error('Authorization error:', error);
            return h.response({ message: 'Authorization failed' }).code(403).takeover();
        }
    };
};
