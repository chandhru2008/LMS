import { LeaveType } from "../leave-types/leave-type-model";
import { dataSource } from "../../config/db/conn";
import { LeaveRequestRepository } from "./leave-request-repository.";

export class LeaveRequestService {
  private leaveRequestRepository: LeaveRequestRepository;


  constructor(leaveRequestRepository: LeaveRequestRepository) {
    this.leaveRequestRepository = leaveRequestRepository;
  }

 
  public async requestLeave(data: any) {
    const leaveTypeRepo = dataSource.getRepository(LeaveType);
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
  
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      throw new Error("Invalid start or end date");
    }
  
    const timeDiff = endDate.getTime() - startDate.getTime();
    const leaveDays = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
  
    let hrApproval: string | "Pending";
    let managerApproval: string | "Pending";
    let directorApproval: string | "Pending";
    let status : string | "Pending";
  
    const leaveType = await leaveTypeRepo.findOne({where : {id : data.leaveTypeId}});

    console.log("Leave type in services : ", leaveType.name);
  
    if (leaveType.name === "Emergency Leave") {
      hrApproval = "Approved";
      managerApproval = "Approved";
      directorApproval = "Approved";
      status = "Approved";
    } else if (leaveDays <= 2) {
      hrApproval = "Approved";
      directorApproval = "Approved";
    } else if (leaveDays <= 4) {
      directorApproval = "Approved";
    } else if (leaveDays > 7) {
    } else {
      directorApproval = "Pending";
    }


    const leaveRequestPayload = {
      ...data,
      hr_approval: hrApproval,
      manager_approval: managerApproval,
      director_approval: directorApproval,
      status : status,
      leaveDays
    };
  
    return await this.leaveRequestRepository.createLeaveRequest(leaveRequestPayload);
  }
  

  async getLeaveHistory(employee : string){

    return await this.leaveRequestRepository.getLeaveHistory(employee);

  }

  async updateStatus(leaveRequestId){
    return this,this.leaveRequestRepository.updateStatus(leaveRequestId)
  }

}
