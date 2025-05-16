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
                const secretKey = process.env.JWT_SECRET;
                const token = request.state.userSession.token;
                const decoded = jwt.verify(token, secretKey);
                const bodyData = request.payload;
                const leaveTypeId = bodyData.leaveTypeId;
                const startDate = bodyData.fromDate;
                const endDate = bodyData.toDate;
                const description = bodyData.reason;
                const employeeId = decoded.payload.id;
                const data = {
                    leaveTypeId: leaveTypeId,
                    startDate: startDate,
                    endDate: endDate,
                    employeeId: employeeId,
                    description: description
                };
                const leaveRequest = yield this.leaveRequestService.createLeaveRequest(data);
                if (!leaveRequest) {
                    return h.response({ message: 'Error creating leave request' }).code(400);
                }
                return h.response({ message: 'Leave request created successfully', leaveRequest }).code(201);
            }
            catch (error) {
                console.error('Error creating leave request:', error);
                return h.response({ message: 'Error creating leave request' }).code(400);
            }
        });
        this.leaveRequestService = leaveRequestService;
    }
    getAllLeaveRequests(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const secretKey = process.env.JWT_SECRET;
                const token = request.state.userSession.token;
                const decoded = jwt.verify(token, secretKey);
                const role = decoded.payload.role;
                //middle ware
                if (role == "Director") {
                    const allLeaveRequest = yield this.leaveRequestService.getAllLeaveRequests();
                    return h.response(allLeaveRequest).code(201);
                }
                else {
                    return h.response({ message: "Unauthorized user" }).code(400);
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    getMyLeaveRequests(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const secretKey = process.env.JWT_SECRET;
                const token = request.state.userSession.token;
                const decoded = jwt.verify(token, secretKey);
                const employee = decoded.payload.id;
                const leaveRequest = yield this.leaveRequestService.getMyLeaveRequests(employee);
                return h.response({ leaveRequest }).code(201);
            }
            catch (e) {
                console.log(e);
                return h.response({ message: e }).code(500);
            }
        });
    }
    getLeaveRequestsForSubordinates(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const secretKey = process.env.JWT_SECRET;
                const token = request.state.userSession.token;
                const decoded = jwt.verify(token, secretKey);
                const role = decoded.payload.role;
                const eId = decoded.payload.id;
                if (role == "Employee") {
                    return h.response({ message: "Unauthorized user" }).code(400);
                }
                const leaveRequestByRole = yield this.leaveRequestService.getRequestsByRole(role, eId);
                return h.response({ leaveRequestByRole }).code(200);
            }
            catch (e) {
                console.log("Error : ", e);
            }
        });
    }
    processDecision(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const secretKey = process.env.JWT_SECRET;
                const token = request.state.userSession.token;
                const decoded = jwt.verify(token, secretKey);
                const role = decoded.payload.role;
                const leaveRequestId = request.params.id;
                const bodyData = request.payload;
                let decision = null;
                if (role == "Manager") {
                    decision = bodyData.manager_approval;
                }
                else if (role == "HR") {
                    decision = bodyData.hr_approval;
                }
                else if (role == "Director") {
                    decision = bodyData.director_approval;
                }
                yield this.leaveRequestService.processDecision(leaveRequestId, role, decision);
                return h.response({ message: "Leave request approved" }).code(201);
            }
            catch (e) {
                return h.response({ Error: e }).code(400);
            }
        });
    }
}
exports.LeaveRequestController = LeaveRequestController;
