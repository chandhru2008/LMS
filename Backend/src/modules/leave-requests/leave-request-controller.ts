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

  
  public requestLeave = async (request: Request, h: ResponseToolkit) => {
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

  async getLeaveRequest(request: Request, h: ResponseToolkit) {
    try {
      const employeeRepo = dataSource.getRepository(Employee)
      const secretKey = process.env.JWT_SECRET;
      const token = request.state.userSession.token;
      const decoded = jwt.verify(token, secretKey);
      const managerId = decoded.payload.id;
      const manager = await employeeRepo.findOne({ where: { id: managerId } });

      console.log("This is manager id : ", managerId);

      const employees = await employeeRepo.find({
        where: { manager: { id: manager.id } },
        relations: ['manager']
      });

      const leaveHistories = [];

      for (const e of employees) {
        const leaveHistory = await this.leaveRequestService.getLeaveHistory(e.id);
        leaveHistories.push({
          employee: e,
          leaveHistory,
        });
      }

      return h.response({ data: leaveHistories }).code(200);



    } catch (e) {
      console.log("Error : ", e)
    }
  }

  async updateStatus(request: Request, h: ResponseToolkit) {
    try {
      const leaveRequestId = request.params.id;
      await this.leaveRequestService.updateStatus(leaveRequestId)
      return h.response({ message: "Leave request approved" }).code(201)
    } catch (e) {
      return h.response({ Error: e }).code(400)
    }
  }
}
