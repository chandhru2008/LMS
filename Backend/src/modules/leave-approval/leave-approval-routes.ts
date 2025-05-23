import { Server } from '@hapi/hapi';
import { LeaveApprovalController } from './leave-approval-controller';

export class LeaveApprovalRoutes {
  constructor(private controller: LeaveApprovalController) {}

  register(server: Server) {
    server.route([
      {
        method: 'GET',
        path: '/approvals',
        handler: this.controller.getMyApprovals.bind(this.controller),
      },
      {
        method: 'PUT',
        path: '/approvals/decision',
        handler: this.controller.handleApproval.bind(this.controller),
      },
    ]);
  }
}
