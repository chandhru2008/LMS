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
exports.LeaveApprovalController = void 0;
const jwt = require('jsonwebtoken');
class LeaveApprovalController {
    constructor(leaveApprovalService) {
        this.leaveApprovalService = leaveApprovalService;
    }
    getMyApprovals(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const secretKey = process.env.JWT_SECRET;
                const JWTtoken = request.state.userSession.token;
                const decode = jwt.verify(JWTtoken, secretKey);
                const role = decode.payload.role;
                if (role === 'HR' || role === 'director' || role === 'hr_manager') {
                    const approvals = yield this.leaveApprovalService.getPendingApprovals();
                    return h.response(approvals).code(200);
                }
                else if (role === 'manager' || role === 'hr_manager') {
                    const managerId = decode.payload.id;
                    const approvals = yield this.leaveApprovalService.getManagerPendingApprovel(managerId);
                    return h.response(approvals).code(200);
                }
            }
            catch (err) {
                return h.response({ error: err.message }).code(500);
            }
        });
    }
    handleApproval(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.payload;
                const decision = body.decision;
                const leaveRequestId = body.leaveRequestId;
                const secretKey = process.env.JWT_SECRET;
                const JWTtoken = request.state.userSession.token;
                const decode = jwt.verify(JWTtoken, secretKey);
                const role = decode.payload.role;
                const approverId = decode.payload.id;
                const result = yield this.leaveApprovalService.approveLeave(leaveRequestId, decision, role, approverId);
                return h.response({ message: result }).code(200);
            }
            catch (err) {
                console.log(err);
                return h.response({ error: err.message }).code(400);
            }
        });
    }
}
exports.LeaveApprovalController = LeaveApprovalController;
