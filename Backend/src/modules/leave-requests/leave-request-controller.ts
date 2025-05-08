import { Request, ResponseToolkit } from '@hapi/hapi';
import { LeaveRequestService } from './leave-request-service';

export class LeaveRequestController {
  private leaveRequestService: LeaveRequestService;

  constructor(leaveRequestService: LeaveRequestService) {
    this.leaveRequestService = leaveRequestService;
  }

  // Controller method to handle the leave request
  public requestLeave = async (request: Request, h: ResponseToolkit) => {
    const { employeeId, leaveTypeId, startDate, endDate, description } = request.payload as any;

    try {
      const leaveRequest = await this.leaveRequestService.requestLeave(employeeId, leaveTypeId, startDate, endDate, description);
      return h.response({ message: 'Leave request created successfully', leaveRequest }).code(201);
    } catch (error) {
      console.error('Error creating leave request:', error);
      return h.response({ message: 'Error creating leave request' }).code(500);
    }
  };
}
