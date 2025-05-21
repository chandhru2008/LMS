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
const leave_type_model_1 = require("../leave-types/leave-type-model");
const conn_1 = require("../../config/db/conn");
class LeaveRequestService {
    constructor(leaveRequestRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
    }
    getAllLeaveRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allLeaveRequests = yield this.leaveRequestRepository.getAllLeaveRequests();
                const data = allLeaveRequests === null || allLeaveRequests === void 0 ? void 0 : allLeaveRequests.map(lr => ({
                    leaveDetails: {
                        leaveRequestId: lr.id,
                        leaveType: lr.leaveType.name,
                        leaveStartDate: lr.start_date,
                        leaveEndDate: lr.end_date,
                        leaveReason: lr.description,
                        approvalStatus: {
                            managerApproval: lr.manager_approval,
                            hrApproval: lr.HR_approval,
                            directorApproval: lr.director_approval
                        },
                        status: lr.status
                    },
                    employeeDetails: {
                        employeeName: lr.employee.name,
                        employeeEmail: lr.employee.email,
                    }
                }));
                return data;
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    createLeaveRequest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const leaveTypeRepo = conn_1.dataSource.getRepository(leave_type_model_1.LeaveType);
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
            try {
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
                    throw new Error("Invalid start or end date");
                }
                const timeDiff = endDate.getTime() - startDate.getTime();
                const leaveDays = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
                const leaveType = yield leaveTypeRepo.findOne({ where: { id: data.leaveTypeId } });
                let hrApproval = "Pending";
                let managerApproval = "Pending";
                let directorApproval = "Pending";
                let status = "Pending";
                const isAutoApprovedType = (leaveType === null || leaveType === void 0 ? void 0 : leaveType.name) === "Emergency Leave" || (leaveType === null || leaveType === void 0 ? void 0 : leaveType.name) === "Sick Leave";
                if (isAutoApprovedType) {
                    hrApproval = managerApproval = directorApproval = status = "Approved";
                }
                else if (data.employeeRole === "director" || data.employeRepo === "hr_manager") {
                    hrApproval = managerApproval = directorApproval = status = "Approved";
                }
                else if (data.role === "manager" && leaveDays <= 7) {
                    managerApproval = "Approved";
                }
                else if (data.role === "HR" && leaveDays <= 7) {
                    hrApproval = "Approved";
                }
                else {
                    if (leaveDays <= 2) {
                        hrApproval = "Approved";
                        directorApproval = "Approved";
                    }
                    else if (leaveDays <= 4) {
                        directorApproval = "Approved";
                    }
                }
                // Update overall status if all approvals are done
                if (hrApproval === "Approved" && managerApproval === "Approved" && directorApproval === "Approved") {
                    status = "Approved";
                }
                const leaveRequestPayload = Object.assign(Object.assign({}, data), { hr_approval: hrApproval, manager_approval: managerApproval, director_approval: directorApproval, status,
                    leaveDays });
                yield this.leaveRequestRepository.createLeaveRequest(leaveRequestPayload);
                return "Leave request submitted successfully";
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
    getMyLeaveRequests(employee) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.leaveRequestRepository.getMyLeaveRequests(employee);
        });
    }
    processDecision(leaveRequestId, role, decision) {
        return __awaiter(this, void 0, void 0, function* () {
            return this, this.leaveRequestRepository.updateStatus(leaveRequestId, role, decision);
        });
    }
    getRequestsByRole(role, eId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const leaveRequestsByRole = yield this.leaveRequestRepository.getRequestsByRole(role, eId);
                console.log("Leave requests : ", leaveRequestsByRole);
                const formattedData = [];
                for (const entry of leaveRequestsByRole !== null && leaveRequestsByRole !== void 0 ? leaveRequestsByRole : []) {
                    const employee = entry.employee;
                    const leaveHistory = entry.leaveHistory;
                    if (!leaveHistory || leaveHistory.length === 0) {
                        continue; // Skip employee with no leave requests
                    }
                    for (const lr of leaveHistory) {
                        formattedData.push({
                            leaveDetails: {
                                leaveRequestId: lr.id,
                                leaveType: lr.leaveType.name,
                                leaveStartDate: lr.start_date,
                                leaveEndDate: lr.end_date,
                                leaveReason: lr.description,
                                approvalStatus: {
                                    managerApproval: lr.manager_approval,
                                    hrApproval: lr.HR_approval,
                                    directorApproval: lr.director_approval
                                },
                                status: lr.status
                            },
                            employeeDetails: {
                                employeeName: employee.name,
                                employeeEmail: employee.email,
                                employeeRole: employee.role
                            }
                        });
                    }
                }
                return formattedData;
            }
            catch (e) {
                console.log(e);
            }
        });
    }
}
exports.LeaveRequestService = LeaveRequestService;
