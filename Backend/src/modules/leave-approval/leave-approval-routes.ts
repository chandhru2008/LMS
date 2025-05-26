import { ResponseToolkit, Server, Request } from '@hapi/hapi';
import { LeaveApprovalController } from './leave-approval-controller';



 export function leaveApproveRoutes(server: Server, leaveApprovalController : LeaveApprovalController) {
    server.route([
      {
        method: 'GET',
        path: '/approvals',
        handler: async (request : Request, response : ResponseToolkit) => {return await leaveApprovalController.getMyApprovals(request, response) } 
      },
      {
        method: 'PUT',
        path: '/approvals/decision',
         handler: async (request : Request, response : ResponseToolkit) => await leaveApprovalController.handleApproval(request, response)
      },
    ]);
  }
