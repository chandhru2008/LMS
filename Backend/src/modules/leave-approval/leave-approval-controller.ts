import { Request, ResponseToolkit } from '@hapi/hapi';
import { LeaveApprovalService } from './leave-approval-service';
const jwt = require('jsonwebtoken');
export class LeaveApprovalController {
    constructor(private leaveApprovalService: LeaveApprovalService) { }

    async getMyApprovals(request: Request, h: ResponseToolkit) {
        try {
            const secretKey = process.env.JWT_SECRET
            const JWTtoken = request.state.userSession.token;
            const decode = jwt.verify(JWTtoken, secretKey);
            const role = decode.payload.role;
            if (role === 'HR' || role === 'director' || role === 'hr_manager') {
                const approvals = await this.leaveApprovalService.getPendingApprovals();
                return h.response(approvals).code(200);
            } else if (role === 'manager' || role === 'hr_manager') {
                const managerId: string = decode.payload.id
                const approvals = await this.leaveApprovalService.getManagerPendingApprovel(managerId);
                return h.response(approvals).code(200);
            }
        } catch (err: any) {
            return h.response({ error: err.message }).code(500);
        }
    }

    async handleApproval(request: Request, h: ResponseToolkit) {
        try {
            const body = request.payload as { decision: 'Approve' | 'Reject', leaveRequestId : string };
            const decision = body.decision;
            const leaveRequestId = body.leaveRequestId
            const secretKey = process.env.JWT_SECRET
            const JWTtoken = request.state.userSession.token;
            const decode = jwt.verify(JWTtoken, secretKey);
            const role = decode.payload.role
            const approverId = decode.payload.id;
            const result = await this.leaveApprovalService.approveLeave(leaveRequestId, decision, role, approverId);
            return h.response({ message: result }).code(200);
        } catch (err: any) {
            console.log(err)
            return h.response({ error: err.message }).code(400);
        }
    }
}
