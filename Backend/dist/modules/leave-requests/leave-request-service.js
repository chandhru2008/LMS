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
exports.LeaveRequestService = void 0;
const conn_1 = require("../../config/db/conn");
const leave_request_model_1 = require("./leave-request-model");
const leave_type_model_1 = require("../leave-types/leave-type-model");
const employee_entity_1 = require("../empolyee/employee-entity");
const leave_balance_model_1 = require("../leave-balances/leave-balance-model");
const leave_approval_model_1 = require("../leave-approval/leave-approval-model");
const typeorm_1 = require("typeorm");
class LeaveRequestService {
    constructor() {
        this.leaveRequestRepo = conn_1.dataSource.getRepository(leave_request_model_1.LeaveRequest);
        this.employeeRepo = conn_1.dataSource.getRepository(employee_entity_1.Employee);
        this.leaveTypeRepo = conn_1.dataSource.getRepository(leave_type_model_1.LeaveType);
        this.leaveApprovalRepo = conn_1.dataSource.getRepository(leave_approval_model_1.LeaveApproval);
        this.leaveBalanceRepo = conn_1.dataSource.getRepository(leave_balance_model_1.LeaveBalance);
    }
    getAllLeaveRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            const allLeaveRequests = yield this.leaveRequestRepo.find({
                relations: ['employee', 'leaveType', 'approvals'],
            });
            if (!allLeaveRequests)
                throw new Error('Error in fetching leave requests');
            return allLeaveRequests.map(req => ({
                id: req.id,
                description: req.description,
                status: req.status,
                start_date: req.start_date,
                end_date: req.end_date,
                created_at: req.created_at,
                employee: {
                    name: req.employee.name,
                    email: req.employee.email,
                },
                leaveType: {
                    id: req.leaveType.id,
                    name: req.leaveType.name,
                },
                approvals: req.approvals.map(appr => ({
                    id: appr.id,
                    level: appr.level,
                    approverRole: appr.approverRole,
                    status: appr.status,
                    approvedAt: appr.approvedAt,
                })),
            }));
        });
    }
    getMyLeaveRequests(employeeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.leaveRequestRepo.find({
                where: { employee: { id: employeeId } },
                relations: ['leaveType', 'approvals'],
                order: { start_date: 'DESC' },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.leaveRequestRepo.findOne({
                where: { id },
                relations: ['employee', 'leaveType', 'approvals'],
            });
        });
    }
    updateStatusByUser(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.leaveRequestRepo.update(id, { status });
            return this.findById(id);
        });
    }
    cancelLeaveRequest(leaveRequestId, eId) {
        return __awaiter(this, void 0, void 0, function* () {
            const leave = yield this.findById(leaveRequestId);
            if (!leave)
                throw new Error('Leave request not found.');
            if (leave.employee.id !== eId)
                throw new Error('Not authorized.');
            if (leave.status !== 'Pending')
                throw new Error('Only pending leave requests can be cancelled.');
            const now = new Date();
            const leaveStart = new Date(leave.start_date);
            if (leaveStart <= now)
                throw new Error('Cannot cancel leave that has started.');
            return yield this.updateStatusByUser(leaveRequestId, 'Cancelled');
        });
    }
    createLeaveRequest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { employeeId, leaveTypeId, startDate, endDate, description, status, employeeRole, } = data;
            const employee = yield this.employeeRepo.findOne({
                where: { id: employeeId },
                relations: ['manager', 'hrManager'],
            });
            if (!employee)
                throw new Error('Employee not found');
            const leaveType = yield this.leaveTypeRepo.findOneBy({ id: leaveTypeId });
            if (!leaveType)
                throw new Error('Leave Type not found');
            const existingLeaves = yield this.leaveRequestRepo.find({
                where: {
                    employee: { id: employeeId },
                    status: (0, typeorm_1.In)(['Pending', 'Approve']),
                },
            });
            const newStart = new Date(startDate);
            const newEnd = new Date(endDate);
            for (const leave of existingLeaves) {
                const existingStart = new Date(leave.start_date);
                const existingEnd = new Date(leave.end_date);
                if (newStart <= existingEnd && newEnd >= existingStart) {
                    throw new Error('Leave request overlaps with an existing leave.');
                }
            }
            const leaveDays = Math.ceil((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const leaveBalance = yield this.leaveBalanceRepo.findOne({
                where: {
                    employee: { id: employee.id },
                    leaveType: { id: leaveType.id },
                },
            });
            if (!leaveBalance)
                throw new Error('Leave balance not found');
            if (employee.gender === 'male' &&
                employee.maritalStatus === 'Married' &&
                leaveType.name === 'Marriage Leave') {
                const previousMarriageLeave = yield this.leaveRequestRepo.findOne({
                    where: {
                        employee: { id: employee.id },
                        leaveType: { id: leaveType.id },
                        status: (0, typeorm_1.In)(['Pending', 'Approve', 'Approved']),
                    },
                });
                if (previousMarriageLeave) {
                    throw new Error('Marriage leave already used.');
                }
            }
            if (leaveType.name === 'Emergency Leave') {
                if (leaveBalance.remaining_leaves < leaveDays) {
                    throw new Error('Insufficient Emergency Leave balance.');
                }
                const leaveRequest = this.leaveRequestRepo.create({
                    employee,
                    leaveType,
                    start_date: startDate,
                    end_date: endDate,
                    description,
                    status: 'Approved', // auto-approve
                });
                yield this.leaveRequestRepo.save(leaveRequest);
                leaveBalance.remaining_leaves -= leaveDays;
                leaveBalance.used_leaves += leaveDays;
                yield this.leaveBalanceRepo.save(leaveBalance);
                return 'Emergency leave auto-approved successfully.';
            }
            if (leaveBalance.remaining_leaves < leaveDays) {
                throw new Error('Insufficient leave balance');
            }
            const leaveRequest = this.leaveRequestRepo.create({
                employee,
                leaveType,
                start_date: startDate,
                end_date: endDate,
                description,
                status,
            });
            const savedLeaveRequest = yield this.leaveRequestRepo.save(leaveRequest);
            const approvals = [];
            if (employeeRole === 'employee') {
                const managerId = (_a = employee.manager) === null || _a === void 0 ? void 0 : _a.id;
                if (!managerId)
                    throw new Error('Manager not assigned');
                if (leaveDays < 3) {
                    approvals.push({ level: 1, approverRole: 'manager', approverId: managerId });
                }
                else if (leaveDays < 7) {
                    approvals.push({ level: 1, approverRole: 'manager', approverId: managerId }, { level: 2, approverRole: 'HR' });
                }
                else {
                    approvals.push({ level: 1, approverRole: 'manager', approverId: managerId }, { level: 2, approverRole: 'director' }, { level: 3, approverRole: 'HR' });
                }
            }
            else if (employeeRole === 'manager') {
                approvals.push(...(leaveDays < 3
                    ? [{ level: 1, approverRole: 'HR' }]
                    : [
                        { level: 1, approverRole: 'director' },
                        { level: 2, approverRole: 'HR' },
                    ]));
            }
            else if (employeeRole === 'HR') {
                const hrManagerId = (_b = employee.hrManager) === null || _b === void 0 ? void 0 : _b.id;
                if (!hrManagerId) {
                    throw new Error('HR manager not found');
                }
                approvals.push(...(leaveDays < 3
                    ? [{ level: 1, approverRole: 'hr_manager', approverId: hrManagerId }]
                    : [
                        { level: 1, approverRole: 'hr_manager', approverId: hrManagerId },
                        { level: 2, approverRole: 'director' },
                    ]));
            }
            else if (employeeRole === 'hr_manager') {
                approvals.push({ level: 1, approverRole: 'director' });
            }
            for (const approval of approvals) {
                const leaveApproval = this.leaveApprovalRepo.create({
                    leaveRequest: savedLeaveRequest,
                    level: approval.level,
                    approverRole: approval.approverRole,
                    status: 'Pending',
                    approver: approval.approverId
                        ? { id: approval.approverId }
                        : undefined,
                });
                yield this.leaveApprovalRepo.save(leaveApproval);
            }
            return 'Leave request submitted successfully and pending approvals.';
        });
    }
}
exports.LeaveRequestService = LeaveRequestService;
