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
const leave_approval_entity_1 = require("./leave-approval-entity");
const leave_request_entity_1 = require("../leave-requests/leave-request-entity");
const leave_balance_entity_1 = require("../leave-balances/leave-balance-entity");
const mailservice_1 = require("../../mailservice");
const email_helper_1 = require("../../common/helpers/email-helper");
const notification_helper_1 = require("../../common/helpers/notification-helper");
const date_utils_1 = require("../../common/utils/date-utils");
class LeaveApprovalService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    getAllPendingApprovals() {
        return __awaiter(this, void 0, void 0, function* () {
            const approvals = yield this.dataSource.getRepository(leave_approval_entity_1.LeaveApproval).find({
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
                        managerRemark: null,
                        hrApproval: null,
                        hrRemark: null,
                        hrManagerApproval: null,
                        hrManagerRemark: null,
                        directorApproval: null,
                        directorRemark: null,
                        overallStatus: approval.leaveRequest.status,
                    });
                }
                const roleGroup = grouped.get(requestId);
                switch (approval.approverRole) {
                    case 'manager':
                        roleGroup.managerApproval = approval.status;
                        roleGroup.managerRemark = approval.remarks;
                        break;
                    case 'hr':
                        roleGroup.hrApproval = approval.status;
                        roleGroup.hrRemark = approval.remarks;
                        break;
                    case 'hr_manager':
                        roleGroup.hrManagerApproval = approval.status;
                        roleGroup.hrManagerRemark = approval.remarks;
                        break;
                    case 'director':
                        roleGroup.directorApproval = approval.status;
                        roleGroup.directorRemark = approval.remarks;
                        break;
                }
            }
            return Array.from(grouped.values());
        });
    }
    getManagerPendingApprovel(approverId) {
        return __awaiter(this, void 0, void 0, function* () {
            const approvals = yield this.dataSource.getRepository(leave_approval_entity_1.LeaveApproval).find({
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
                        roleGroup.hrManagerApproval = approval.status;
                        break;
                }
            }
            const result = Array.from(grouped.values());
            return result;
        });
    }
    approveLeave(leaveRequestId, decision, role, approverId, remark) {
        return __awaiter(this, void 0, void 0, function* () {
            const approvalRepo = this.dataSource.getRepository(leave_approval_entity_1.LeaveApproval);
            const leaveRequestRepo = this.dataSource.getRepository(leave_request_entity_1.LeaveRequest);
            const leaveBalanceRepo = this.dataSource.getRepository(leave_balance_entity_1.LeaveBalance);
            const approval = yield approvalRepo.findOne({
                where: { leaveRequest: { id: leaveRequestId }, approverRole: role },
                relations: ['leaveRequest', 'leaveRequest.employee', 'approver'],
            });
            const leaveRequest = yield leaveRequestRepo.findOne({
                where: { id: leaveRequestId },
                relations: ['leaveType', 'employee'],
            });
            if (!approval || !leaveRequest)
                throw new Error('Approval or Leave Request not found');
            // Prevent approving expired leave
            if (new Date(approval.leaveRequest.end_date) < new Date()) {
                throw new Error('Cannot approve leave requests for past dates');
            }
            // Assign approver if not already set
            if (!approval.approver || approval.approver.id === null) {
                approval.approver = { id: approverId };
            }
            // Update status and remarks
            approval.status = decision === 'Approve' ? 'Approved' : 'Rejected';
            approval.remarks = remark;
            approval.approvedAt = new Date();
            // Save approval
            try {
                yield approvalRepo.save(approval);
            }
            catch (err) {
                console.error('Failed to save approval:', err);
                throw new Error('Database error during approval save');
            }
            // Notify next role if required
            yield (0, notification_helper_1.notifyNextApproverIfAny)(this.dataSource, role, leaveRequestId, leaveRequest);
            // Check if all approvals are completed
            const allApprovals = yield approvalRepo.find({
                where: { leaveRequest: { id: leaveRequestId } },
            });
            const allApproved = allApprovals.every(a => a.status === 'Approved');
            if (!allApproved)
                return 'Approval saved';
            // Finalize leave request
            leaveRequest.status = 'Approved';
            yield leaveRequestRepo.save(leaveRequest);
            // Update leave balance
            const leaveBalance = yield leaveBalanceRepo.findOne({
                where: {
                    leaveType: { id: leaveRequest.leaveType.id },
                    employee: { id: leaveRequest.employee.id },
                },
            });
            if (!leaveBalance)
                throw new Error('Leave balance not found');
            const leaveDays = (0, date_utils_1.calculateLeaveDays)(leaveRequest.start_date, leaveRequest.end_date);
            if (leaveBalance.remaining_leaves < leaveDays) {
                throw new Error('Insufficient leave balance');
            }
            leaveBalance.used_leaves += leaveDays;
            leaveBalance.remaining_leaves = leaveBalance.total - leaveBalance.used_leaves;
            yield leaveBalanceRepo.save(leaveBalance);
            // Notify employee
            const leaveInfo = `Your leave request for ${leaveRequest.leaveType.name} from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been fully approved.`;
            const description = leaveRequest.description;
            const html = (0, email_helper_1.getEmailHtml)();
            (0, mailservice_1.sendEmail)(leaveRequest.employee.email, leaveInfo, description, html);
            return 'Leave fully approved';
        });
    }
}
exports.LeaveApprovalService = LeaveApprovalService;
