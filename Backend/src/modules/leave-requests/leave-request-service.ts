import { LeaveType } from "../leave-types/leave-type-model";
import { dataSource } from "../../config/db/conn";
import { LeaveRequestRepository } from "./leave-request-repository.";

export class LeaveRequestService {
  private leaveRequestRepository: LeaveRequestRepository;


  constructor(leaveRequestRepository: LeaveRequestRepository) {
    this.leaveRequestRepository = leaveRequestRepository;
  }


  async getAllLeaveRequests() {
    try {
      const allLeaveRequests = await this.leaveRequestRepository.getAllLeaveRequests();

      const data = allLeaveRequests?.map(lr => ({
        leaveDetails: {
          leaveRequestId: lr.id,
          leaveType: lr.leaveType.name,
          leaveStartDate: lr.start_date,
          leaveEndDate: lr.end_date,
          leaveReason: lr.description,
          approvalStatus: {
            managerApproval: lr.manager_approval,
            hrApproval: lr.HR_approval,
            directorApproval: lr.director_approval
          },
          status: lr.status
        },
        employeeDetails: {
          employeeName: lr.employee.name,
          employeeEmail: lr.employee.email,
        }
      }));

      return data;
    } catch (e) {
      console.log(e);
    }
  }

  public async createLeaveRequest(data: any) {
    const leaveTypeRepo = dataSource.getRepository(LeaveType);
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);


    try {
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
        throw new Error("Invalid start or end date");
      }

      const timeDiff = endDate.getTime() - startDate.getTime();
      const leaveDays = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;

      const leaveType = await leaveTypeRepo.findOne({ where: { id: data.leaveTypeId } });

      let hrApproval: string = "Pending";
      let managerApproval: string = "Pending";
      let directorApproval: string = "Pending";
      let status: string = "Pending";

      const isAutoApprovedType = leaveType?.name === "Emergency Leave" || leaveType?.name === "Sick Leave";

      if (isAutoApprovedType) {
        hrApproval = managerApproval = directorApproval = status = "Approved";
      } else if (data.employeeRole === "director" || data.employeRepo === "hr_manager") {
        hrApproval = managerApproval = directorApproval = status = "Approved";
      } else if (data.role === "manager" && leaveDays <= 7) {
        managerApproval = "Approved";
      } else if (data.role === "HR" && leaveDays <= 7) {
        hrApproval = "Approved";
      } else {
        if (leaveDays <= 2) {
          hrApproval = "Approved";
          directorApproval = "Approved";
        } else if (leaveDays <= 4) {
          directorApproval = "Approved";
        }
      }

      // Update overall status if all approvals are done
      if (hrApproval === "Approved" && managerApproval === "Approved" && directorApproval === "Approved") {
        status = "Approved";
      }

      const leaveRequestPayload = {
        ...data,
        hr_approval: hrApproval,
        manager_approval: managerApproval,
        director_approval: directorApproval,
        status,
        leaveDays
      };

      await this.leaveRequestRepository.createLeaveRequest(leaveRequestPayload);
      return "Leave request submitted successfully";
    } catch (e: any) {
      throw new Error(e.message);
    }


  }


  async getMyLeaveRequests(employee: string) {

    return await this.leaveRequestRepository.getMyLeaveRequests(employee);

  }

  async processDecision(leaveRequestId: string, role: string, decision: string) {
    return this, this.leaveRequestRepository.updateStatus(leaveRequestId, role, decision)
  }
  async getRequestsByRole(role: string, eId: string) {
    try {
      const leaveRequestsByRole = await this.leaveRequestRepository.getRequestsByRole(role, eId);
      console.log("Leave requests : ", leaveRequestsByRole)
      const formattedData = [];

      for (const entry of leaveRequestsByRole ?? []) {
        const employee = entry.employee;
        const leaveHistory = entry.leaveHistory;

        if (!leaveHistory || leaveHistory.length === 0) {
          continue; // Skip employee with no leave requests
        }

        for (const lr of leaveHistory) {
          formattedData.push({
            leaveDetails: {
              leaveRequestId: lr.id,
              leaveType: lr.leaveType.name,
              leaveStartDate: lr.start_date,
              leaveEndDate: lr.end_date,
              leaveReason: lr.description,
              approvalStatus: {
                managerApproval: lr.manager_approval,
                hrApproval: lr.HR_approval,
                directorApproval: lr.director_approval
              },
              status: lr.status
            },
            employeeDetails: {
              employeeName: employee.name,
              employeeEmail: employee.email,
              employeeRole : employee.role
            }
          });
        }
      }

      return formattedData;

    } catch (e) {
      console.log(e);
    }
  }
}
