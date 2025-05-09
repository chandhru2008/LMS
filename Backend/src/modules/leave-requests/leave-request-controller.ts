const jwt = require('jsonwebtoken');
import { Request, ResponseToolkit } from '@hapi/hapi';
import { LeaveRequestService } from './leave-request-service';
import { describe } from 'node:test';

export class LeaveRequestController {
  private leaveRequestService: LeaveRequestService;

  constructor(leaveRequestService: LeaveRequestService) {
    this.leaveRequestService = leaveRequestService;
  }

  // Controller method to handle the leave request
  public requestLeave = async (request: Request, h: ResponseToolkit) => {
    try {
      const secretKey = process.env.JWT_SECRET;
      const token = request.state.userSession.token;
      const decoded = jwt.verify(token, secretKey);
      const bodyData = request.payload as any;
      const leaveType = bodyData.leaveType;
      const startDate = bodyData.fromDate;
      const endDate = bodyData.toDate;
      const description = bodyData.reason;
      const employeeId = decoded.payload.id;
      const data = {
        leaveType: leaveType,
        startDate: startDate,
        endDate: endDate,
        employee: employeeId,
        description: description
      }
      const leaveRequest = await this.leaveRequestService.requestLeave(data);
      return h.response({ message: 'Leave request created successfully', leaveRequest }).code(201);
    } catch (error) {

      console.error('Error creating leave request:', error);
      return h.response({ message: 'Error creating leave request' }).code(500);
    }

  };

  async getLeaveHistory(request: Request, h: ResponseToolkit) {
    try {
      const secretKey = process.env.JWT_SECRET;
      const token = request.state.userSession.token;
      const decoded = jwt.verify(token, secretKey);
      const employee = decoded.payload.id;
      const leaveHistory = await this.leaveRequestService.getLeaveHistory(employee);
      return h.response({ leaveHistory: leaveHistory }).code(201);
    } catch (e) {
      console.log(e);
      return h.response({ message: e }).code(500);
    }
  }
}
