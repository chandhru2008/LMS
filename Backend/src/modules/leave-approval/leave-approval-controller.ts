import { Request, ResponseToolkit } from '@hapi/hapi';
import { LeaveApprovalService } from './leave-approval-service';

export class LeaveApprovalController {
    constructor(private leaveApprovalService: LeaveApprovalService) { }

    async getMyApprovals(request: Request, h: ResponseToolkit) {
        try {
            const role = (request as any).auth.credentials.payload.role
            const id = (request as any).auth.credentials.payload.id
            if (role === 'hr' || role === 'director') {
                const approvals = await this.leaveApprovalService.getAllPendingApprovals();
                return h.response(approvals).code(200);
            } else if (role === 'manager' || role === 'hr_manager') {
                const approverId: string = id
                const approvals = await this.leaveApprovalService.getManagerPendingApprovel(approverId);
                return h.response(approvals).code(200);
            }
        } catch (err: any) {
            return h.response({ error: err.message }).code(500);
        }
    }

    async handleApproval(request: Request, h: ResponseToolkit) {
        try {
            const body = request.payload as { decision: 'Approve' | 'Reject', leaveRequestId: string };
            const decision = body.decision;
            const leaveRequestId = body.leaveRequestId;
            const role = (request as any).auth.credentials.payload.role
            const approverId = (request as any).auth.credentials.payload.id
            const result = await this.leaveApprovalService.approveLeave(leaveRequestId, decision, role, approverId);
            return h.response({ message: result }).code(200);
        } catch (err: any) {
            console.log(err)
            return h.response({ error: err.message }).code(400);
        }
    }
}
