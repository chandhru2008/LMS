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
        method: 'GET',
        path: '/all-leave-requests',
        handler: this.leaveRequestController.getAllLeaveRequests.bind(this.leaveRequestController)
      },
      {
        method: 'POST',
        path: '/create-leave-request',
        handler: this.leaveRequestController.createLeaveRequest.bind(this.leaveRequestController)
      },
      {
        method: "GET",
        path: '/leave-requests/my',
        handler: this.leaveRequestController.getMyLeaveRequests.bind(this.leaveRequestController)
      },
      {
        method: "GET",
        path: '/leave-requests/subordinates',
        handler: this.leaveRequestController.getLeaveRequestsForSubordinates.bind(this.leaveRequestController)
      },
      {
        method: 'PUT',
        path: '/leave-requests/{id}/decision',
        options: {
          cors: {
            origin: ['http://localhost:5173'],
            credentials: true,
          }
        },
        handler: this.leaveRequestController.processDecision.bind(this.leaveRequestController)
      }
    ]);
  }
}
