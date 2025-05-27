import { Server } from '@hapi/hapi';
import { LeaveTypeController } from "./leave-type-controller";
import { Request, ResponseToolkit } from '@hapi/hapi';
import { authenticate } from '../../middleware/auth-middleware';



export function leaveTypeRoutes(server: Server, leaveTypeController: LeaveTypeController) {

    server.route([
        {
            method: 'GET',
            path: "/leave-types",
            handler: async (request: Request, response: ResponseToolkit) => { return await leaveTypeController.getAllLeaveTypes(request, response) }

        }, {
            method: 'GET',
            path: "/leave-types/eligibility",
            options: {
                pre: [{ method: authenticate }],
                handler: async (request: Request, response: ResponseToolkit) => { return await leaveTypeController.getLeaveTypesByEligibility(request, response) }
            }
        }
    ])

}
