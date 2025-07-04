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
exports.LeaveTypeController = void 0;
class LeaveTypeController {
    constructor(leaveTypeService) {
        this.leaveTypeService = leaveTypeService;
    }
    getAllLeaveTypes(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const leaveTypes = yield this.leaveTypeService.getAllLeaveTypes();
                return h.response(leaveTypes).code(200);
            }
            catch (error) {
                console.error('Controller error:', error);
                return h.response({ message: 'Failed to fetch leave types' }).code(400);
            }
        });
    }
    getLeaveTypesByEligibility(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gender = request.auth.credentials.payload.gender;
                const maritalStatus = request.auth.credentials.payload.materialStatus;
                request.auth.credentials.payload;
                const leaveTypesByEligibility = yield this.leaveTypeService.getLeaveTypeByEligibility(gender, maritalStatus);
                return h.response(leaveTypesByEligibility).code(200);
            }
            catch (error) {
                console.error('Controller error:', error);
                return h.response({ message: 'Failed to fetch leave types' }).code(400);
            }
        });
    }
}
exports.LeaveTypeController = LeaveTypeController;
