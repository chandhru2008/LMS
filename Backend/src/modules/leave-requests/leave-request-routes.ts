import { Server } from '@hapi/hapi';
import { LeaveRequestController } from './leave-request-controller';
import { Request, ResponseToolkit } from '@hapi/hapi';
import { authenticate, authorizeRoles } from '../../middleware/auth-middleware';



export function leaveRequestRoutes(server: Server, leaveRequestController: LeaveRequestController) {
  server.route([
    {
      method: 'GET',
      path: '/all-leave-requests',
      options: {
        pre: [{ method: authenticate },
        { method: authorizeRoles(['hr', 'director' ]) }
        ],
        handler: async (request: Request, response: ResponseToolkit) => { return await leaveRequestController.getAllLeaveRequests(request, response) }
      }

    },
    {
      method : 'GET',
      path : '/all-leave-requests-by-role',
      options : {
        pre : [{method : authenticate},
          {method : authorizeRoles(['manager', 'hr_manager'])}],
          handler : async (request : Request , response : ResponseToolkit) => {return await leaveRequestController.getAllLeaveRequestsByRole(request , response)}
      }
    },
    {
      method: 'POST',
      path: '/create-leave-request',
      options: {
        pre: [{ method: authenticate }],
        handler: async (request: Request, response: ResponseToolkit) => { return await leaveRequestController.createLeaveRequest(request, response) }
      }
    },
    {
      method: "GET",
      path: '/leave-requests/my',
      options: {
        pre: [{ method: authenticate }],
        handler: async (request: Request, response: ResponseToolkit) => { return await leaveRequestController.getMyLeaveRequests(request, response) }
      }
    },
    {
      method: 'PUT',
      path: '/leave-requests/cancel',
      options: {
        pre: [{ method: authenticate }],
        handler: async (request: Request, response: ResponseToolkit) => { return await leaveRequestController.cancelLeaveRequest(request, response) }
      }
    }
  ]);
}

