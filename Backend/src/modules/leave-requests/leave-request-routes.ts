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
        handler: this.leaveRequestController.requestLeave.bind(this.leaveRequestController) // Bind method to controller
      },
    ]);
  }
}
