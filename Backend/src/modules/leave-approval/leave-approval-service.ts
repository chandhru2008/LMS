import { DataSource } from 'typeorm';
import { LeaveApproval } from './leave-approval-model';
import { LeaveRequest } from '../leave-requests/leave-request-model';
import { LeaveBalance } from '../leave-balances/leave-balance-model';

export class LeaveApprovalService {
    constructor(private dataSource: DataSource) { }

    async getPendingApprovals() {


        const approvals = await this.dataSource.getRepository(LeaveApproval).find({
            where: { status: 'Pending' },
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
                case 'HR':
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

    async getManagerPendingApprovel(managerId: string) {


        const approvals = await this.dataSource.getRepository(LeaveApproval).find({
            where: {
                approver: { id: managerId },
                status: 'Pending'
            },
            relations: ['leaveRequest', 'leaveRequest.employee', 'leaveRequest.leaveType', 'approver'],
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
                    directorApproval: null,
                    overallStatus: approval.leaveRequest.status,
                });
            }



            const roleGroup = grouped.get(requestId);
            switch (approval.approverRole) {
                case 'manager':
                    roleGroup.managerApproval = approval.status;
                    break;
                case 'HR':
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
        role: 'manager' | 'HR' | 'hr_manager' | 'director',
        approverId: string
    ) {
        const approvalRepo = this.dataSource.getRepository(LeaveApproval);
        const leaveRequestRepo = this.dataSource.getRepository(LeaveRequest);
        const leaveBalanceRepo = this.dataSource.getRepository(LeaveBalance);



        // Step 1: Fetch approval entry
        const approvals = await approvalRepo.findOne({
            where: { leaveRequest: { id: leaveRequestId }, approverRole: role },
            relations: ['leaveRequest', 'leaveRequest.employee', 'approver'],
        });

        if (!approvals) {
            throw new Error('Approval recored not found')
        }

        if (!approvals.approver || approvals.approver.id === null) {
            approvals.approver = { id: approverId } as any;
            if (decision === 'Approve') {
                approvals.status = 'Approved'
            } else if (decision === 'Reject') {
                approvals.status = 'Rejected'
            }
            try {
                await approvalRepo.save(approvals);
            } catch (err) {
                console.error('Failed to save approval:', err);
            }
        } else {
            if (decision === 'Approve') {
                approvals.status = 'Approved'
            } else if (decision === 'Reject') {
                approvals.status = 'Rejected'
            } try {
                await approvalRepo.save(approvals);
            } catch (err) {
                console.error('Failed to save approval:', err);
            }
        }
        const allApproval = await approvalRepo.find({
            where: { leaveRequest: { id: leaveRequestId } },
            relations: ['leaveRequest', 'leaveRequest.employee', 'approver'],
        })

        if (!allApproval) {
            throw new Error('Leave approval records not found')
        }
        const allApproved = allApproval.every(a => a.status === 'Approved');

        const leaveRequest = await leaveRequestRepo.findOne({ where: { id: leaveRequestId }, relations: ['leaveType', 'employee'] });



        if (!leaveRequest) {
            throw new Error('Leave request not found');
        }




        if (allApproved) {
            leaveRequest.status = 'Approved';
            await leaveRequestRepo.save(leaveRequest);

            const leaveBalance = await leaveBalanceRepo.findOne({ where: { leaveType: { id: leaveRequest.leaveType.id }, employee: { id: leaveRequest.employee.id } } });

            function calculateLeaveDays(startDate: string, endDate: string): number {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
                return diffDays;
            }

            if (!leaveBalance) {
                throw new Error('Leave balance not found');
            }

            const leaveDays = calculateLeaveDays(leaveRequest.start_date, leaveRequest.end_date);
            if (leaveBalance.remaining_leaves < leaveDays) {
                throw new Error('Insufficient leave balance')
            }
            leaveBalance.used_leaves = leaveBalance.used_leaves + leaveDays;
            leaveBalance.remaining_leaves = leaveBalance.total - leaveBalance.used_leaves
            leaveBalanceRepo.save(leaveBalance);
            return 'Leave fully approved';
        };
    }
}







