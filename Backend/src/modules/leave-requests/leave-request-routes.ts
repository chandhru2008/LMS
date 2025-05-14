import { Server } from '@hapi/hapi';
import { LeaveRequestController } from './leave-request-controller';

export class LeaveRequestRoutes {
  private leaveRequestController: LeaveRequestController;

  constructor(leaveRequestController: LeaveRequestController) {
    this.leaveRequestController = leaveRequestController;
  }

  public leaveRequestRoutes(server: Server) {
    server.route([
      {
        method: 'POST',
        path: '/leave-request',
        handler: this.leaveRequestController.requestLeave.bind(this.leaveRequestController) 
      },
      {
        method : "GET",
        path : '/leave-history',
        handler : this.leaveRequestController.getLeaveHistory.bind(this.leaveRequestController)
      },
      {
        method : "GET",
        path : '/manager/leaves',
        handler : this.leaveRequestController.getLeaveRequest.bind(this.leaveRequestController)
      },
      {
        method : 'PUT',
        path : '/leave-request/{id}/approve',
        handler : this.leaveRequestController.updateStatus.bind(this.leaveRequestController)
      }
    ]);
  }
}
