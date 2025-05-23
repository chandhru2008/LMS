const jwt = require('jsonwebtoken');
import { Request, ResponseToolkit } from '@hapi/hapi';
import { LeaveRequestService } from './leave-request-service';


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
      if (role === "director" || role === "hr_manager" || role === "HR") {
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
      const employeeRole = decoded.payload.role

      const data = {
        leaveTypeId: leaveTypeId,
        startDate: startDate,
        endDate: endDate,
        employeeId: employeeId,
        employeeRole: employeeRole,
        description: description
      }

      const leaveRequest = await this.leaveRequestService.createLeaveRequest(data);

      if (!leaveRequest) {
        return h.response({ message: 'Error creating leave request' }).code(400);
      }

      return h.response({ message: 'Leave request created successfully', leaveRequest }).code(201);

    } catch (error: any) {
      return h.response({ message: error.message }).code(400);
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
      return h.response({ message: e }).code(500);
    }
  }



  

  async cancelLeaveRequest(req: Request, h: ResponseToolkit) {
    const secretKey = process.env.JWT_SECRET;
    const token = req.state.userSession.token;
    const decoded = jwt.verify(token, secretKey);
    const eId = decoded.payload.id;
    const body = req.payload as any;
    const leaveRequestId = body.id



    if (!leaveRequestId) {
      return h.response({ message: "Leave request ID is required." }).code(400);
    }

    try {
      const result = await this.leaveRequestService.cancelLeaveRequest(leaveRequestId, eId);
      return h.response({ message: "Leave request cancelled successfully.", result }).code(200);
    } catch (err) {
      console.error("Error cancelling leave:", err);
      return h.response({ message: "error " }).code(400);
    }
  }

}
