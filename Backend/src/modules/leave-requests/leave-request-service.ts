import { LeaveType } from "../leave-types/leave-type-model";
import { dataSource } from "../../config/db/conn";
import { LeaveRequestRepository } from "./leave-request-repository.";
import { LeaveApproval } from "../leave-approval/leave-approval-model";
import { Employee } from "../empolyee/employee-model";
import { LeaveRequest } from "./leave-request-model";
import { LeaveBalance } from "../leave-balances/leave-balance-model";
import { In } from "typeorm";

export class LeaveRequestService {
  private leaveRequestRepository: LeaveRequestRepository;


  constructor(leaveRequestRepository: LeaveRequestRepository) {
    this.leaveRequestRepository = leaveRequestRepository;
  }


  async getAllLeaveRequests() {
    try {
      const allLeaveRequests = await this.leaveRequestRepository.getAllLeaveRequests();

      if(!allLeaveRequests){
        throw new Error('Error in fetching leave request')
      }

      const sanitized = allLeaveRequests.map(req => ({
        id: req.id,
        description: req.description,
        status: req.status,
        start_date: req.start_date,
        end_date: req.end_date,
        created_at: req.created_at,
        employee: {
          name: req.employee.name,
          email: req.employee.email
        },
        leaveType: {
          id: req.leaveType.id,
          name: req.leaveType.name
        },
        approvals: req.approvals.map(appr => ({
          id: appr.id,
          level: appr.level,
          approverRole: appr.approverRole,
          status: appr.status,
          approvedAt: appr.approvedAt
        }))
      }));

      return sanitized;
    } catch (e) {
      console.log(e);
    }
  }

  public async createLeaveRequest(data: any) {

    try {
      const employeeRepo = dataSource.getRepository(Employee);
      const leaveTypeRepo = dataSource.getRepository(LeaveType);
      const leaveRequestRepo = dataSource.getRepository(LeaveRequest);
      const leaveApprovalRepo = dataSource.getRepository(LeaveApproval);
      const leaveBalanceRepo = dataSource.getRepository(LeaveBalance);

      const {
        employeeId,
        leaveTypeId,
        startDate,
        endDate,
        description,
        status,
        employeeRole,
      } = data;



      const employee = await employeeRepo.findOne({
        where: { id: employeeId },
        relations: ['manager'],
      });

      if (!employee) throw new Error("Employee not found");

      const leaveType = await leaveTypeRepo.findOneBy({ id: leaveTypeId });
      if (!leaveType) throw new Error("Leave Type not found");

      // Overlapping Leave Check
      const existingLeaves = await leaveRequestRepo.find({
        where: { employee: { id: employeeId }, status: In(['Pending', 'Approve']) },
        relations: ['employee'],
      });

      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);

      for (const leave of existingLeaves) {
        const existingStart = new Date(leave.start_date);
        const existingEnd = new Date(leave.end_date);
        const overlaps = newStart <= existingEnd && newEnd >= existingStart;
        if (overlaps) throw new Error("Leave request overlaps with an existing leave.");
      }

      // Create Leave Request (but do NOT update balance yet)

      const leaveRequest = new LeaveRequest();

      leaveRequest.employee = employee;
      leaveRequest.leaveType = leaveType;
      leaveRequest.start_date = startDate;
      leaveRequest.end_date = endDate;
      leaveRequest.description = description;
      leaveRequest.status = status;


      function calculateLeaveDays(startDate: string, endDate: string): number {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
        return diffDays;
      }

      const leaveDays = calculateLeaveDays(startDate, endDate);

      const leaveBalance = await leaveBalanceRepo.findOne({
        where: {
          employee: { id: employee.id },
          leaveType: { id: leaveType.id },
        },
      });

      if (!leaveBalance) {
        throw new Error('Leave balance not found');
      }

      const remainingLeaves = leaveBalance.remaining_leaves;

      if (remainingLeaves < leaveDays) {
        throw new Error('Insufficient leave balance');
      }


      const savedLeaveRequest = await leaveRequestRepo.save(leaveRequest);

      // Determine Approval Chain
      const approvals: {
        level: number;
        approverRole: string;
        approverId?: string;
        status?: string;
      }[] = [];


      if (employeeRole === 'employee') {
        const managerId = employee.manager?.id;
        if (!managerId) throw new Error("Manager not assigned");

        if (leaveDays < 3) {
          approvals.push({ level: 1, approverRole: 'manager', approverId: managerId, status: 'Pending' });
        } else if (leaveDays < 7) {
          approvals.push(
            { level: 1, approverRole: 'manager', status: 'Pending', approverId: managerId },
            { level: 2, approverRole: 'HR', status: 'Pending' }
          );
        } else {
          approvals.push(
            { level: 1, approverRole: 'manager', approverId: managerId },
            { level: 2, approverRole: 'director', status: 'Pending' },
            { level: 3, approverRole: 'HR', status: 'Pending' }
          );
        }
      } else if (employeeRole === 'manager') {
        if (leaveDays < 3) {
          approvals.push({ level: 1, approverRole: 'HR', status: 'Pending' });
        } else {
          approvals.push(
            { level: 1, approverRole: 'director', status: 'Pending' },
            { level: 2, approverRole: 'HR', status: 'Pending' }
          );
        }
      } else if (employeeRole === 'HR') {
        if (leaveDays < 3) {
          approvals.push({ level: 1, approverRole: 'hr_manager', status: 'Pending' });
        } else {
          approvals.push(
            { level: 1, approverRole: 'hr_manager', status: 'Pending' },
            { level: 2, approverRole: 'director', status: 'Pending' }
          );
        }
      } else if (employeeRole === 'hr_manager') {
        approvals.push({ level: 1, approverRole: 'director', status: 'Pending' });
      } else if (employeeRole === 'director') {
        // Director doesn't need approval
      } else {
        throw new Error("Invalid employee role");
      }


      // Save all approval levels (pending)
      for (const approval of approvals) {
        const leaveApproval = new LeaveApproval();
        leaveApproval.leaveRequest = savedLeaveRequest;
        leaveApproval.level = approval.level;
        leaveApproval.approverRole = approval.approverRole;
        if (approval.approverId) {
          leaveApproval.approver = { id: approval.approverId } as Employee;
        }
        leaveApproval.status == null ? 'Approved' : 'Pending'

        await leaveApprovalRepo.save(leaveApproval);
      }

      return "Leave request submitted successfully and pending approvals.";
    } catch (e) {
      console.log(e)
    }



  }

  async getMyLeaveRequests(employee: string) {

    return await this.leaveRequestRepository.getMyLeaveRequests(employee);

  }


  async cancelLeaveRequest(leaveRequestId: string, eId: string) {
    const leave = await this.leaveRequestRepository.findById(leaveRequestId);

    if (!leave) {
      throw new Error("Leave request not found.");
    }

    if (leave.employee.id !== eId) {
      throw new Error("You are not authorized to cancel this leave.");
    }

    if (leave.status !== "Pending") {
      throw new Error("Only pending leave requests can be cancelled.");
    }

    const currentDate = new Date();
    const leaveStartDate = new Date(leave.start_date);
    if (leaveStartDate <= currentDate) {
      throw new Error("Cannot cancel leave that has already started or passed.");
    }

    return await this.leaveRequestRepository.updateStatusByUser(leaveRequestId, "Cancelled");
  }
}
