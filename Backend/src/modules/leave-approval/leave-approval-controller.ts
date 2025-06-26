import { Request, ResponseToolkit } from '@hapi/hapi';
import { LeaveApprovalService } from './leave-approval-service';

export class LeaveApprovalController {
    constructor(private leaveApprovalService: LeaveApprovalService) { }

    async getMyApprovals(request: Request, h: ResponseToolkit) {
        try {
            const role = request.auth.credentials.payload.role
            const id = request.auth.credentials.payload.id
            if (role === 'hr' || role === 'director') {
                const approvals = await this.leaveApprovalService.getAllPendingApprovals();
                return h.response(approvals).code(200);
            } else if (role === 'manager' || role === 'hr_manager') {
                const approverId: string = id
                const approvals = await this.leaveApprovalService.getManagerPendingApprovel(approverId);
                return h.response(approvals).code(200);
            }
        } catch (err) {
            return h.response({ error: err.message }).code(500);
        }
    }

    async handleApproval(request: Request, h: ResponseToolkit) {
        try {
            const body = request.payload as { decision: 'Approve' | 'Reject', leaveRequestId: string , remarks : string};
            const decision = body.decision;
            const leaveRequestId = body.leaveRequestId;
            const role = request.auth.credentials.payload.role
            const approverId = request.auth.credentials.payload.id;
            const remarks = body.remarks
            const result = await this.leaveApprovalService.approveLeave(leaveRequestId, decision, role, approverId, remarks);
            return h.response({ message: result }).code(200);
        } catch (err) {
            console.log("Error in handling approvals : ", err)
            return h.response({ error: err.message }).code(400);
        }
    }
}
