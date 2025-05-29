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
exports.LeaveRequestController = void 0;
const jwt = require('jsonwebtoken');
class LeaveRequestController {
    constructor(leaveRequestService) {
        this.createLeaveRequest = (request, h) => __awaiter(this, void 0, void 0, function* () {
            try {
                const bodyData = request.payload;
                const leaveTypeId = bodyData.leaveTypeId;
                const startDate = bodyData.fromDate;
                const endDate = bodyData.toDate;
                const description = bodyData.reason;
                const employeeId = request.auth.credentials.payload.id;
                const employeeRole = request.auth.credentials.payload.role;
                const data = {
                    leaveTypeId: leaveTypeId,
                    startDate: startDate,
                    endDate: endDate,
                    employeeId: employeeId,
                    employeeRole: employeeRole,
                    description: description,
                    status: 'Pending'
                };
                const leaveRequest = yield this.leaveRequestService.createLeaveRequest(data);
                if (!leaveRequest) {
                    return h.response({ message: 'Error creating leave request' }).code(400);
                }
                return h.response({ message: 'Leave request created successfully', leaveRequest }).code(201);
            }
            catch (error) {
                return h.response({ message: error.message }).code(400);
            }
        });
        this.leaveRequestService = leaveRequestService;
    }
    getAllLeaveRequests(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allLeaveRequest = yield this.leaveRequestService.getAllLeaveRequests();
                return h.response(allLeaveRequest).code(201);
            }
            catch (e) {
                console.log("Error in getting all leave requests : ", e);
            }
        });
    }
    getAllLeaveRequestsByRole(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = request.auth.credentials.payload.role;
            const id = request.auth.credentials.payload.id;
            const allLeaveRequest = yield this.leaveRequestService.getAllLeaveRequestsByRole(role, id);
            return h.response(allLeaveRequest).code(201);
        });
    }
    getMyLeaveRequests(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employeeId = request.auth.credentials.payload.id;
                const leaveRequest = yield this.leaveRequestService.getMyLeaveRequests(employeeId);
                return h.response({ leaveRequest }).code(201);
            }
            catch (e) {
                return h.response({ message: e }).code(500);
            }
        });
    }
    cancelLeaveRequest(req, h) {
        return __awaiter(this, void 0, void 0, function* () {
            const eId = req.auth.credentials.payload.id;
            const body = req.payload;
            const leaveRequestId = body.id;
            if (!leaveRequestId) {
                return h.response({ message: "Leave request ID is required." }).code(400);
            }
            try {
                const result = yield this.leaveRequestService.cancelLeaveRequest(leaveRequestId, eId);
                return h.response({ message: "Leave request cancelled successfully.", result }).code(200);
            }
            catch (err) {
                console.error("Error cancelling leave:", err);
                return h.response({ message: "error " }).code(400);
            }
        });
    }
}
exports.LeaveRequestController = LeaveRequestController;
