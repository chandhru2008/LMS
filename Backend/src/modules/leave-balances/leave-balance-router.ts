
import { Server } from '@hapi/hapi';
import { LeaveBalanceController } from './leave-balance-controller';

export class LeaveBalanceRoute {

    private leaveBalanceController: LeaveBalanceController;

    constructor(leaveBalanceController: LeaveBalanceController) {
        this.leaveBalanceController = leaveBalanceController;
    }

    public leaveBalanceRoute(server: Server) {
        server.route([
            {
                method: 'GET',
                path: '/leave-balances',
                handler: async (request, h) => {
                    console.log("Leave balance rout fit : ", request)
                    return this.leaveBalanceController.fetchEmployeeLeaveBalance(request, h)
                }
            }
        ]);
    }
}
