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
exports.LeaveRequestRepository = void 0;
const conn_1 = require("../../config/db/conn");
const leave_request_model_1 = require("./leave-request-model");
const leave_type_model_1 = require("../leave-types/leave-type-model");
const employee_model_1 = require("../empolyee/employee-model");
const leave_balance_model_1 = require("../leave-balances/leave-balance-model");
class LeaveRequestRepository {
    constructor() {
        this.repo = conn_1.dataSource.getRepository(leave_request_model_1.LeaveRequest);
    }
    getAllLeaveRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allLeaveRequest = yield this.repo.find({
                    relations: ['employee', 'leaveType'],
                });
                console.log(allLeaveRequest);
                return allLeaveRequest;
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    createLeaveRequest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employeeRepo = conn_1.dataSource.getRepository(employee_model_1.Employee);
                const leaveTypeRepo = conn_1.dataSource.getRepository(leave_type_model_1.LeaveType);
                const leaveBalanceRepo = conn_1.dataSource.getRepository(leave_balance_model_1.LeaveBalance);
                const employeeId = data.employeeId;
                const leaveTypeName = data.leaveTypeId;
                const employee = yield employeeRepo.findOneBy({ id: employeeId });
                const leaveType = yield leaveTypeRepo.findOneBy({ id: leaveTypeName });
                const employeeLeaveRequests = yield this.repo.find({ where: { employee: { id: employeeId } }, relations: ['employee'] });
                const newStart = new Date(data.startDate);
                const newEnd = new Date(data.endDate);
                for (let lr of employeeLeaveRequests) {
                    const existingStart = new Date(lr.start_date);
                    const existingEnd = new Date(lr.end_date);
                    // Check for overlap
                    const overlaps = (newStart <= existingEnd) && (newEnd >= existingStart);
                    if (overlaps) {
                        throw new Error("Leave request overlaps with an existing leave.");
                    }
                }
                if (!employee)
                    throw new Error("Employee not found");
                if (!leaveType)
                    throw new Error("Leave Type not found");
                const leaveRequest = new leave_request_model_1.LeaveRequest();
                leaveRequest.employee = employee;
                leaveRequest.leaveType = leaveType;
                leaveRequest.start_date = data.startDate;
                leaveRequest.end_date = data.endDate;
                leaveRequest.description = data.description;
                leaveRequest.manager_approval = data.manager_approval;
                leaveRequest.HR_approval = data.hr_approval;
                leaveRequest.director_approval = data.director_approval;
                leaveRequest.status = data.status;
                const leaveBalance = yield leaveBalanceRepo.findOne({
                    where: {
                        employee: { id: employee.id },
                        leaveType: { id: leaveType.id },
                    },
                    relations: ['employee', 'leaveType'],
                });
                if (!leaveBalance)
                    throw new Error("Leave balance not found");
                if (leaveBalance.remaining_leaves < data.leaveDays) {
                    throw new Error("Insufficient leave balance");
                }
                leaveBalance.used_leaves += data.leaveDays;
                leaveBalance.remaining_leaves -= data.leaveDays;
                yield leaveBalanceRepo.save(leaveBalance);
                yield this.repo.save(leaveRequest);
                return "Leave request submitted successfully";
            }
            catch (e) {
                console.log("Error : ", e);
            }
        });
    }
    getMyLeaveRequests(employee) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const leaveRequest = yield this.repo.find({
                    where: { employee: { id: employee } },
                    relations: ['leaveType'],
                    order: { start_date: 'DESC' },
                });
                return leaveRequest;
            }
            catch (error) {
                console.error('Error fetching leave history:', error);
                throw new Error('Could not fetch leave history.');
            }
        });
    }
    updateStatus(leaveRequestId, role, decision) {
        return __awaiter(this, void 0, void 0, function* () {
            const leaveRequestRepo = conn_1.dataSource.getRepository(leave_request_model_1.LeaveRequest);
            try {
                const leaveRequest = yield leaveRequestRepo.findOne({ where: { id: leaveRequestId } });
                console.log(role);
                if (!leaveRequest) {
                    throw new Error("Leave request not found");
                }
                if (decision == "Approve" && role == "Manager") {
                    leaveRequest.manager_approval = "Approved";
                }
                else if (decision == "Approve" && role == "HR") {
                    leaveRequest.HR_approval = "Approved";
                }
                else if (decision == "Approve" && role == "Director") {
                    leaveRequest.director_approval = "Approved";
                }
                if (decision == "Reject" && role == "Manager") {
                    leaveRequest.manager_approval = "Rejected";
                }
                else if (decision == "Reject" && role == "HR") {
                    leaveRequest.HR_approval = "Rejected";
                }
                else if (decision == "Reject" && role == "Director") {
                    leaveRequest.director_approval = "Rejected";
                }
                if (leaveRequest.HR_approval == "Approved" && leaveRequest.director_approval == "Approved" && leaveRequest.manager_approval == "Approved") {
                    leaveRequest.status = "Approved";
                }
                if (leaveRequest.HR_approval == "Rejected" || leaveRequest.director_approval == "Rejected" || leaveRequest.manager_approval == "Rejected") {
                    leaveRequest.status = "Rejected";
                }
                yield leaveRequestRepo.save(leaveRequest);
                return ({ message: 'Leave approved successfully' });
            }
            catch (error) {
                console.error('Error approving leave:', error);
                return ({ message: 'Failed to approve leave', error });
            }
        });
    }
    getRequestsByRole(role, eId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employeeRepo = conn_1.dataSource.getRepository(employee_model_1.Employee);
                let employees = [];
                if (role == "Manager") {
                    employees = yield employeeRepo.find({
                        where: { manager: { id: eId } },
                        relations: ['manager']
                    });
                }
                else if (role == "HR") {
                    employees = yield employeeRepo.find({
                        where: { HR: { id: eId } },
                        relations: ['HR']
                    });
                }
                const leaveRequests = [];
                for (const e of employees) {
                    const leaveHistory = yield this.getMyLeaveRequests(e.id);
                    leaveRequests.push({
                        employee: e,
                        leaveHistory,
                    });
                }
                return leaveRequests;
            }
            catch (e) {
                console.log(e);
            }
        });
    }
}
exports.LeaveRequestRepository = LeaveRequestRepository;
