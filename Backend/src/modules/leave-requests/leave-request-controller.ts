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
      const allLeaveRequest = await this.leaveRequestService.getAllLeaveRequests();
      return h.response(allLeaveRequest).code(201);
    } catch (e) {
      console.log("Error in getting all leave requests : ", e);
    }

  }

  async getAllLeaveRequestsByRole(request : Request, h : ResponseToolkit){
    const role = request.auth.credentials.payload.role;
    const id = request.auth.credentials.payload.id;
    const allLeaveRequest = await this.leaveRequestService.getAllLeaveRequestsByRole(role, id);
     return h.response(allLeaveRequest).code(201);
  }


  public createLeaveRequest = async (request: Request, h: ResponseToolkit) => {
    try {

      const bodyData = request.payload as any;
      const leaveTypeId = bodyData.leaveTypeId;
      const startDate = bodyData.fromDate;
      const endDate = bodyData.toDate;
      const description = bodyData.reason;
      const employeeId = request.auth.credentials.payload.id
      const employeeRole = request.auth.credentials.payload.role

      const data = {
        leaveTypeId: leaveTypeId,
        startDate: startDate,
        endDate: endDate,
        employeeId: employeeId,
        employeeRole: employeeRole,
        description: description,
        status : 'Pending'
      }

      const leaveRequest = await this.leaveRequestService.createLeaveRequest(data);

      if (!leaveRequest) {
        return h.response({ message: 'Error creating leave request' }).code(400);
      }

      return h.response({ message: 'Leave request created successfully', leaveRequest }).code(201);

    } catch (error) {
      return h.response({ message: error.message }).code(400);
    }

  };

  async getMyLeaveRequests(request: Request, h: ResponseToolkit) {
    try {
      const employeeId = request.auth.credentials.payload.id
      const leaveRequest = await this.leaveRequestService.getMyLeaveRequests(employeeId);
      return h.response({ leaveRequest }).code(201);
    } catch (e) {
      return h.response({ message: e }).code(500);
    }
  }





  async cancelLeaveRequest(req: Request, h: ResponseToolkit) {

    const eId = req.auth.credentials.payload.id;
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
