import { DataSource } from 'typeorm';
import { LeaveApproval } from './leave-approval-entity';
import { LeaveRequest } from '../leave-requests/leave-request-entity';
import { LeaveBalance } from '../leave-balances/leave-balance-entity';
import { sendEmail } from '../../mailservice';
import { getEmailHtml } from '../../common/helpers/email-helper';
import { notifyNextApproverIfAny } from '../../common/helpers/notification-helper';
import { calculateLeaveDays } from '../../common/utils/date-utils';

export class LeaveApprovalService {
    constructor(private dataSource: DataSource) { }

    async getAllPendingApprovals() {


        const approvals = await this.dataSource.getRepository(LeaveApproval).find({
            relations: ['leaveRequest', 'leaveRequest.employee', 'leaveRequest.leaveType'],
        });


        const grouped = new Map();

        for (const approval of approvals) {
            const requestId = approval.leaveRequest.id;

            if (!grouped.has(requestId)) {
                grouped.set(requestId, {
                    leaveRequestId: requestId,
                    startDate: approval.leaveRequest.start_date,
                    endDate: approval.leaveRequest.end_date,
                    employeeName: approval.leaveRequest.employee.name,
                    employeeEmail: approval.leaveRequest.employee.email,
                    employeeRole: approval.leaveRequest.employee.role,
                    leaveType: approval.leaveRequest.leaveType.name,
                    description: approval.leaveRequest.description,
                    managerApproval: null,
                    hrApproval: null,
                    hrManagerApproval: null,
                    directorApproval: null,
                    overallStatus: approval.leaveRequest.status,
                });
            }

            const roleGroup = grouped.get(requestId);
            switch (approval.approverRole) {
                case 'manager':
                    roleGroup.managerApproval = approval.status;
                    break;
                case 'hr':
                    roleGroup.hrApproval = approval.status;
                    break;
                case 'director':
                    roleGroup.directorApproval = approval.status;
                    break;
                case 'hr_manager':
                    roleGroup.hrManagerApproval = approval.status;
                    break;
            }
        }

        const result = Array.from(grouped.values());

        return result;

    }

    async getManagerPendingApprovel(approverId: string) {



        const approvals = await this.dataSource.getRepository(LeaveApproval).find({
            where: {
                approver: { id: approverId },
            },
            relations: ['leaveRequest', 'leaveRequest.employee', 'leaveRequest.leaveType', 'approver'],
        });



        if (!approvals) {
            throw new Error('Approvals not found');
        }


        const grouped = new Map();

        for (const approval of approvals) {
            const requestId = approval.leaveRequest.id;

            if (!grouped.has(requestId)) {
                grouped.set(requestId, {
                    leaveRequestId: requestId,
                    startDate: approval.leaveRequest.start_date,
                    endDate: approval.leaveRequest.end_date,
                    employeeName: approval.leaveRequest.employee.name,
                    employeeEmail: approval.leaveRequest.employee.email,
                    employeeRole: approval.leaveRequest.employee.role,
                    leaveType: approval.leaveRequest.leaveType.name,
                    description: approval.leaveRequest.description,
                    managerApproval: null,
                    hrApproval: null,
                    directorApproval: null,
                    overallStatus: approval.leaveRequest.status,
                });
            }



            const roleGroup = grouped.get(requestId);
            switch (approval.approverRole) {
                case 'manager':
                    roleGroup.managerApproval = approval.status;
                    break;
                case 'hr':
                    roleGroup.hrApproval = approval.status;
                    break;
                case 'director':
                    roleGroup.directorApproval = approval.status;
                    break;
                case 'hr_manager':
                    roleGroup.hrManagerApproval = approval.status
                    break;

            }
        }

        const result = Array.from(grouped.values());
        return result;
    }


    async approveLeave(
        leaveRequestId: string,
        decision: 'Approve' | 'Reject',
        role: 'manager' | 'hr' | 'hr_manager' | 'director' | 'employee',
        approverId: string,
        remark: string
    ) {
        const approvalRepo = this.dataSource.getRepository(LeaveApproval);
        const leaveRequestRepo = this.dataSource.getRepository(LeaveRequest);
        const leaveBalanceRepo = this.dataSource.getRepository(LeaveBalance);
        

        const approval = await approvalRepo.findOne({
            where: { leaveRequest: { id: leaveRequestId }, approverRole: role },
            relations: ['leaveRequest', 'leaveRequest.employee', 'approver'],
        });

        const leaveRequest = await leaveRequestRepo.findOne({
            where: { id: leaveRequestId },
            relations: ['leaveType', 'employee'],
        });

        if (!approval || !leaveRequest) throw new Error('Approval or Leave Request not found');

        // Prevent approving expired leave
        if (new Date(approval.leaveRequest.end_date) < new Date()) {
            throw new Error('Cannot approve leave requests for past dates');
        }

        // Assign approver if not already set
        if (!approval.approver || approval.approver.id === null) {
            approval.approver = { id: approverId } as any;
        }

        // Update status and remarks
        approval.status = decision === 'Approve' ? 'Approved' : 'Rejected';
        approval.remarks = remark;

        // Save approval
        try {
            await approvalRepo.save(approval);
        } catch (err) {
            console.error('Failed to save approval:', err);
            throw new Error('Database error during approval save');
        }

        // Notify next role if required
        await notifyNextApproverIfAny(this.dataSource, role, leaveRequestId, leaveRequest);

        // Check if all approvals are completed
        const allApprovals = await approvalRepo.find({
            where: { leaveRequest: { id: leaveRequestId } },
        });

        const allApproved = allApprovals.every(a => a.status === 'Approved');
        if (!allApproved) return 'Approval saved';

        // Finalize leave request
        leaveRequest.status = 'Approved';
        await leaveRequestRepo.save(leaveRequest);

        // Update leave balance
        const leaveBalance = await leaveBalanceRepo.findOne({
            where: {
                leaveType: { id: leaveRequest.leaveType.id },
                employee: { id: leaveRequest.employee.id },
            },
        });

        if (!leaveBalance) throw new Error('Leave balance not found');

        const leaveDays = calculateLeaveDays(leaveRequest.start_date, leaveRequest.end_date);
        if (leaveBalance.remaining_leaves < leaveDays) {
            throw new Error('Insufficient leave balance');
        }

        leaveBalance.used_leaves += leaveDays;
        leaveBalance.remaining_leaves = leaveBalance.total - leaveBalance.used_leaves;
        await leaveBalanceRepo.save(leaveBalance);

        // Notify employee
        const leaveInfo = `Your leave request for ${leaveRequest.leaveType.name} from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been fully approved.`;
        const description = leaveRequest.description;
        const html = getEmailHtml();
        sendEmail(leaveRequest.employee.email, leaveInfo, description, html);

        return 'Leave fully approved';
    }

}







