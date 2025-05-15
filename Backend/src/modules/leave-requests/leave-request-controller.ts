const jwt = require('jsonwebtoken');
import { Request, ResponseToolkit } from '@hapi/hapi';
import { LeaveRequestService } from './leave-request-service';
import { describe } from 'node:test';
import { dataSource } from '../../config/db/conn';
import { Employee } from '../empolyee/employee-model';

export class LeaveRequestController {
  private leaveRequestService: LeaveRequestService;

  constructor(leaveRequestService: LeaveRequestService) {
    this.leaveRequestService = leaveRequestService;
  }


  async getAllLeaveRequests(request: Request, h: ResponseToolkit) {
    try {
      const secretKey = process.env.JWT_SECRET;
      const token = request.state.userSession.token;
      const decoded = jwt.verify(token, secretKey);
      const role = decoded.payload.role;

      //middle ware
      if (role == "Director") {
        const allLeaveRequest = await this.leaveRequestService.getAllLeaveRequests();
        return h.response(allLeaveRequest).code(201);
      } else {
        return h.response({ message: "Unauthorized user" }).code(400);
      }

    } catch (e) {
      console.log(e);
    }

  }


  public createLeaveRequest = async (request: Request, h: ResponseToolkit) => {
    try {
      const secretKey = process.env.JWT_SECRET;
      const token = request.state.userSession.token;
      const decoded = jwt.verify(token, secretKey);
      const bodyData = request.payload as any;
      const leaveTypeId = bodyData.leaveTypeId;
      const startDate = bodyData.fromDate;
      const endDate = bodyData.toDate;
      const description = bodyData.reason;
      const employeeId = decoded.payload.id;

      const data = {
        leaveTypeId: leaveTypeId,
        startDate: startDate,
        endDate: endDate,
        employeeId: employeeId,
        description: description
      }

      const leaveRequest = await this.leaveRequestService.createLeaveRequest(data);

      return h.response({ message: 'Leave request created successfully', leaveRequest }).code(201);

    } catch (error) {
      console.error('Error creating leave request:', error);
      return h.response({ message: 'Error creating leave request' }).code(500);
    }

  };

  async getMyLeaveRequests(request: Request, h: ResponseToolkit) {
    try {
      const secretKey = process.env.JWT_SECRET;
      const token = request.state.userSession.token;
      const decoded = jwt.verify(token, secretKey);
      const employee = decoded.payload.id;
      const leaveRequest = await this.leaveRequestService.getMyLeaveRequests(employee);
      return h.response({ leaveRequest }).code(201);
    } catch (e) {
      console.log(e);
      return h.response({ message: e }).code(500);
    }
  }

  async getLeaveRequestsForSubordinates(request: Request, h: ResponseToolkit) {
    try {

      const secretKey = process.env.JWT_SECRET;
      const token = request.state.userSession.token;
      const decoded = jwt.verify(token, secretKey);
      const role = decoded.payload.role
      const eId = decoded.payload.id

      if (role == "Employee") {
        return h.response({ message: "Unauthorized user" }).code(400)
      }

      const leaveRequestByRole = await this.leaveRequestService.getRequestsByRole(role, eId)
      return h.response({ leaveRequestByRole }).code(200);

    } catch (e) {
      console.log("Error : ", e)
    }
  }

  async processDecision(request: Request, h: ResponseToolkit) {
    try {
      const secretKey = process.env.JWT_SECRET;
      const token = request.state.userSession.token;
      const decoded = jwt.verify(token, secretKey);
      const role = decoded.payload.role
      const leaveRequestId = request.params.id;
      const bodyData = request.payload as any;
      let decision = null;
      if (role == "Manager") {
        decision = bodyData.manager_approval
      } else if (role == "HR") {
        decision = bodyData.hr_approval
      } else if (role == "Director") {
        decision = bodyData.director_approval
      }
      await this.leaveRequestService.processDecision(leaveRequestId, role, decision)
      return h.response({ message: "Leave request approved" }).code(201)
    } catch (e) {
      return h.response({ Error: e }).code(400)
    }
  }

}
