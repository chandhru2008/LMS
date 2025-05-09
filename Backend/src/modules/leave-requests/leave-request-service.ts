import { LeaveTypeRepository } from "../leave-types/leave-repository";
import { LeaveRequestRepository } from "./leave-request-repository.";

export class LeaveRequestService {
  private leaveRequestRepository: LeaveRequestRepository;


  constructor(leaveRequestRepository: LeaveRequestRepository) {
    this.leaveRequestRepository = leaveRequestRepository;
  }

 
  public async requestLeave(data: any) {
    console.log("Description in repo Service", data.description);
  
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
  
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      throw new Error("Invalid start or end date");
    }
  
    const timeDiff = endDate.getTime() - startDate.getTime();
    const leaveDays = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
  
    let hrApproval: string | null = null;
    let managerApproval: string | null = null;
    let directorApproval: string | null = null;
  
    
    const leaveType = data.leaveType?.toLowerCase();
  
    if (leaveType === "emergency") {
      hrApproval = "Approved";
      managerApproval = "Approved";
      directorApproval = "Approved";
    } else if (leaveDays < 2) {
      hrApproval = "Approved";
      directorApproval = "Approved";
    } else if (leaveDays <= 4) {
      directorApproval = "Approved";
    } else if (leaveDays > 7) {
      // Everyone must manually approve
    } else {
      directorApproval = "Pending";
    }
  
    // Overall status
    const status =
      hrApproval === "Approved" &&
      (managerApproval === "Approved" || managerApproval === null) &&
      directorApproval === "Approved"
        ? "Approved"
        : "Pending";
  
    const leaveRequestPayload = {
      ...data,
      hr_approval: hrApproval,
      manager_approval: managerApproval,
      director_approval: directorApproval,
      status,
    };
  
    return await this.leaveRequestRepository.createLeaveRequest(leaveRequestPayload);
  }
  

  async getLeaveHistory(employee : string){

    return await this.leaveRequestRepository.getLeaveHistory(employee);

  }

  // Additional service methods can be added here
}
