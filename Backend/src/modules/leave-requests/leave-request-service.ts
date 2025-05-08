import { LeaveRequestRepository } from "./leave-request-repository.";

export class LeaveRequestService {
  private leaveRequestRepository: LeaveRequestRepository;

  constructor(leaveRequestRepository: LeaveRequestRepository) {
    this.leaveRequestRepository = leaveRequestRepository;
  }

  // Service method to create a leave request
  public async requestLeave(employeeId: string, leaveTypeId: string, startDate: string, endDate: string, description : string) {
    return await this.leaveRequestRepository.createLeaveRequest(employeeId, leaveTypeId, startDate, endDate, description);
  }

  // Additional service methods can be added here
}
