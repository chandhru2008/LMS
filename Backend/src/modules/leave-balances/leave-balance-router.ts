
import { Server } from '@hapi/hapi';
import { LeaveBalanceController } from './leave-balance-controller';
import { authenticate } from '../../middleware/auth-middleware';


export function leaveBalanceRoute(server: Server, leaveBalanceController: LeaveBalanceController) {
    server.route([
        {
            method: 'GET',
            path: '/leave-balances',
            options: {
                pre: [{ method: authenticate }],
                handler: async (request, h) => {
                    return await leaveBalanceController.fetchEmployeeLeaveBalance(request, h);
                }
            }

        }
    ]);
}

