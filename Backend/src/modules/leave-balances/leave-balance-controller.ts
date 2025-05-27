const jwt = require('jsonwebtoken');
import { ResponseToolkit, Request } from "@hapi/hapi";
import { LeaveBalanceService } from "./leave-balance-service";

export class LeaveBalanceController {

    private leaveBalanceService: LeaveBalanceService;

    constructor(leaveBalanceService: LeaveBalanceService) {
        this.leaveBalanceService = leaveBalanceService;
    }

    async fetchEmployeeLeaveBalance(request: Request, h: ResponseToolkit) {
        try {
            const employee = (request as any).auth.credentials.payload;
            const leaveBalance = await this.leaveBalanceService.fetchEmployeeLeaveBalance(employee);
            return h.response(leaveBalance).code(200);
        } catch (err) {
            return h.response({ error: 'Invalid token' }).code(401);
        }
    }


}