const jwt = require('jsonwebtoken');
import { ResponseToolkit,  Request } from "@hapi/hapi";
import { LeaveBalanceService } from "./leave-balance-service";

export class LeaveBalanceController {

    private leaveBalanceService : LeaveBalanceService;

    constructor(leaveBalanceService : LeaveBalanceService){
        this.leaveBalanceService = leaveBalanceService;
    }
    
    async assignDefaultLeaveBalances(employeeData: any) {
        console.log("Leave balance controller called successfully")
        this.leaveBalanceService.assignDefaultLeaveBalances(employeeData);
    }

    async fetchEmployeeLeaveBalance(request: Request, h : ResponseToolkit) {

        const secretKey = process.env.JWT_SECRET;

        const token = request.state.userSession.token;


        try {
            const decoded = jwt.verify(token, secretKey)
            const employee = decoded.payload;
            console.log(employee)
          const leaveBalance = await  this.leaveBalanceService.fetchEmployeeLeaveBalance(employee);
            return h.response({  leaveBalance });
        } catch (err) {
            return h.response({ error: 'Invalid token' }).code(401);
        }
    }

    
}