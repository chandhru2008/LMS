const jwt = require('jsonwebtoken');
import { Request, ResponseToolkit } from '@hapi/hapi';
import { LeaveRequestService } from './leave-request-service';

export class LeaveRequestController {
  private leaveRequestService: LeaveRequestService;

  constructor(leaveRequestService: LeaveRequestService) {
    this.leaveRequestService = leaveRequestService;
  }

  // Controller method to handle the leave request
  public requestLeave = async (request: Request, h: ResponseToolkit) => {

    const secretKey = process.env.JWT_SECRET;

    const token = request.state.userSession.token;


    const decoded = jwt.verify(token, secretKey);
  


    const bodyData = request.payload as any;
    const leaveType = bodyData.leaveType;
    const startDate = bodyData.startDate;
    const end_date = bodyData.endDate
    const employeeId = decoded.payload.id;

const data = {
   leaveType : leaveType,
   startDate : startDate,
   end_date : end_date,
   employeeId :  employeeId

}


    // try {
    //   const leaveRequest = await this.leaveRequestService.requestLeave(employeeId, leaveTypeId, startDate, endDate, description);
    //   return h.response({ message: 'Leave request created successfully', leaveRequest }).code(201);
    // } catch (error) {
    //   console.error('Error creating leave request:', error);
    //   return h.response({ message: 'Error creating leave request' }).code(500);
    // }
  };
}
