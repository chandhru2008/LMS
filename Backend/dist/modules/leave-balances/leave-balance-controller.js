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
exports.LeaveBalanceController = void 0;
const jwt = require('jsonwebtoken');
class LeaveBalanceController {
    constructor(leaveBalanceService) {
        this.leaveBalanceService = leaveBalanceService;
    }
    fetchEmployeeLeaveBalance(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employee = request.auth.credentials.payload;
                const leaveBalance = yield this.leaveBalanceService.fetchEmployeeLeaveBalance(employee);
                return h.response(leaveBalance).code(200);
            }
            catch (err) {
                return h.response({ error: 'Invalid token' }).code(401);
            }
        });
    }
}
exports.LeaveBalanceController = LeaveBalanceController;
