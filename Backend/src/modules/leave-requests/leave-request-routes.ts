import { Server } from '@hapi/hapi';
import { LeaveRequestController } from './leave-request-controller';
import { Request, ResponseToolkit } from '@hapi/hapi';



  export function leaveRequestRoutes(server: Server, leaveRequestController: LeaveRequestController) {
    server.route([
      {
        method: 'GET',
        path: '/all-leave-requests',
        handler: async (request : Request, response : ResponseToolkit) =>{return await leaveRequestController.getAllLeaveRequests(request, response)}
      },
      {
        method: 'POST',
        path: '/create-leave-request',
        handler: async (request : Request, response : ResponseToolkit) => {return await leaveRequestController.createLeaveRequest(request, response)}
      },
      {
        method: "GET",
        path: '/leave-requests/my',
        handler: async (request : Request, response : ResponseToolkit) => {return await leaveRequestController.getMyLeaveRequests(request, response)}
      },
       {
        method : 'PUT',
        path : '/leave-requests/cancel',
        handler :async (request : Request, response : ResponseToolkit)  => {return await leaveRequestController.cancelLeaveRequest(request, response)}
      }
    ]);
  }

