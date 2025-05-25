
import { Server } from '@hapi/hapi';
import { LeaveBalanceController } from './leave-balance-controller';


    export function leaveBalanceRoute(server: Server, leaveBalanceController : LeaveBalanceController) {
        server.route([
            {
                method: 'GET',
                path: '/leave-balances',
                handler: async (request, h) => {
                    return await leaveBalanceController.fetchEmployeeLeaveBalance(request, h);
                }
            }
        ]);
    }

