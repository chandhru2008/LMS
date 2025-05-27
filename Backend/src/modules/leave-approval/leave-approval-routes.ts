import { ResponseToolkit, Server, Request } from '@hapi/hapi';
import { LeaveApprovalController } from './leave-approval-controller';
import { authenticate, authorizeRoles } from '../../middleware/auth-middleware';



export function leaveApproveRoutes(server: Server, leaveApprovalController: LeaveApprovalController) {
  server.route([
    {
      method: 'GET',
      path: '/approvals',
      options: {
        pre: [
          { method: authenticate },
          { method: authorizeRoles(['hr', 'manager', 'hr_manager', 'director']) }
        ],
        handler: async (request: Request, response: ResponseToolkit) => { return await leaveApprovalController.getMyApprovals(request, response) }
      }

    },
    {
      method: 'PUT',
      path: '/approvals/decision',
      options: {
        pre: [
          { method: authenticate },
          { method: authorizeRoles(['hr', 'manager', 'hr_manager', 'director']) }
        ],
        handler: async (request: Request, response: ResponseToolkit) => { return await leaveApprovalController.handleApproval(request, response) }
      }

    },
  ]);
}
