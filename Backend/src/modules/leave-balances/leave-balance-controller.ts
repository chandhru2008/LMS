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

}