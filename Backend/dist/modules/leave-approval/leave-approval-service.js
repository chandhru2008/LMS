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
exports.LeaveApprovalService = void 0;
const leave_approval_model_1 = require("./leave-approval-model");
const leave_request_model_1 = require("../leave-requests/leave-request-model");
const leave_balance_model_1 = require("../leave-balances/leave-balance-model");
class LeaveApprovalService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    getPendingApprovals() {
        return __awaiter(this, void 0, void 0, function* () {
            const approvals = yield this.dataSource.getRepository(leave_approval_model_1.LeaveApproval).find({
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
        });
    }
    getManagerPendingApprovel(managerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const approvals = yield this.dataSource.getRepository(leave_approval_model_1.LeaveApproval).find({
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
                        roleGroup.hrManagerApproval = approval.status;
                        break;
                }
            }
            const result = Array.from(grouped.values());
            return result;
        });
    }
    approveLeave(leaveRequestId, decision, role, approverId) {
        return __awaiter(this, void 0, void 0, function* () {
            const approvalRepo = this.dataSource.getRepository(leave_approval_model_1.LeaveApproval);
            const leaveRequestRepo = this.dataSource.getRepository(leave_request_model_1.LeaveRequest);
            const leaveBalanceRepo = this.dataSource.getRepository(leave_balance_model_1.LeaveBalance);
            // Step 1: Fetch approval entry
            const approvals = yield approvalRepo.findOne({
                where: { leaveRequest: { id: leaveRequestId }, approverRole: role },
                relations: ['leaveRequest', 'leaveRequest.employee', 'approver'],
            });
            if (!approvals) {
                throw new Error('Approval recored not found');
            }
            if (!approvals.approver || approvals.approver.id === null) {
                approvals.approver = { id: approverId };
                if (decision === 'Approve') {
                    approvals.status = 'Approved';
                }
                else if (decision === 'Reject') {
                    approvals.status = 'Rejected';
                }
                try {
                    yield approvalRepo.save(approvals);
                }
                catch (err) {
                    console.error('Failed to save approval:', err);
                }
            }
            else {
                if (decision === 'Approve') {
                    approvals.status = 'Approved';
                }
                else if (decision === 'Reject') {
                    approvals.status = 'Rejected';
                }
                try {
                    yield approvalRepo.save(approvals);
                }
                catch (err) {
                    console.error('Failed to save approval:', err);
                }
            }
            const allApproval = yield approvalRepo.find({
                where: { leaveRequest: { id: leaveRequestId } },
                relations: ['leaveRequest', 'leaveRequest.employee', 'approver'],
            });
            if (!allApproval) {
                throw new Error('Leave approval records not found');
            }
            const allApproved = allApproval.every(a => a.status === 'Approved');
            const leaveRequest = yield leaveRequestRepo.findOne({ where: { id: leaveRequestId }, relations: ['leaveType', 'employee'] });
            if (!leaveRequest) {
                throw new Error('Leave request not found');
            }
            if (allApproved) {
                leaveRequest.status = 'Approved';
                yield leaveRequestRepo.save(leaveRequest);
                const leaveBalance = yield leaveBalanceRepo.findOne({ where: { leaveType: { id: leaveRequest.leaveType.id }, employee: { id: leaveRequest.employee.id } } });
                function calculateLeaveDays(startDate, endDate) {
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
                    throw new Error('Insufficient leave balance');
                }
                leaveBalance.used_leaves = leaveBalance.used_leaves + leaveDays;
                leaveBalance.remaining_leaves = leaveBalance.total - leaveBalance.used_leaves;
                leaveBalanceRepo.save(leaveBalance);
                return 'Leave fully approved';
            }
            ;
        });
    }
}
exports.LeaveApprovalService = LeaveApprovalService;
