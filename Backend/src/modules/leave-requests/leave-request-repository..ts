import { dataSource } from '../../config/db/conn';
import { LeaveRequest } from './leave-request-model';
import { LeaveType } from '../leave-types/leave-type-model';
import { Employee } from '../empolyee/employee-model';
import { Repository } from 'typeorm';
import { LeaveBalance } from '../leave-balances/leave-balance-model';

export class LeaveRequestRepository {
  private repo: Repository<LeaveRequest>;

  constructor() {
    this.repo = dataSource.getRepository(LeaveRequest);
  }

  async getAllLeaveRequests() {
    try {
      const allLeaveRequest = await this.repo.find({
        relations: ['employee', 'leaveType'],
      });
      console.log(allLeaveRequest)
      return allLeaveRequest;
    } catch (e) {
      console.log(e);
    }

  }
  public async createLeaveRequest(
    data: any
  ) {

    try {
      const employeeRepo = dataSource.getRepository(Employee);
      const leaveTypeRepo = dataSource.getRepository(LeaveType);
      const leaveBalanceRepo = dataSource.getRepository(LeaveBalance);

      const employeeId = data.employeeId;
      const leaveTypeName = data.leaveTypeId

      console.log(leaveTypeName)

      const employee = await employeeRepo.findOneBy({ id: employeeId });
      const leaveType = await leaveTypeRepo.findOneBy({ id: leaveTypeName });



      console.log("Leave type name in leave repos : ", leaveType)

      if (!employee) throw new Error("Employee not found");
      if (!leaveType) throw new Error("Leave Type not found");

      const leaveRequest = new LeaveRequest();
      leaveRequest.employee = employee;
      leaveRequest.leaveType = leaveType;
      leaveRequest.start_date = data.startDate
      leaveRequest.end_date = data.endDate
      leaveRequest.description = data.description
      leaveRequest.manager_approval = data.manager_approval
      leaveRequest.HR_approval = data.hr_approval
      leaveRequest.director_approval = data.director_approval;
      leaveRequest.status = data.status

      const leaveBalance = await leaveBalanceRepo.findOne({
        where: {
          employee: { id: employee.id },
          leaveType: { id: leaveType.id },
        },
        relations: ['employee', 'leaveType'],
      });

      console.log("This is leave balance in repo : ", leaveBalance)

      if (!leaveBalance) throw new Error("Leave balance not found");

      if (leaveBalance.remaining_leaves < data.leaveDays) {
        throw new Error("Insufficient leave balance");
      }

      leaveBalance.used_leaves += data.leaveDays;
      leaveBalance.remaining_leaves -= data.leaveDays

      await leaveBalanceRepo.save(leaveBalance);


      return await this.repo.save(leaveRequest);
    } catch (e) {
      console.log("Error : ", e)
    }

  }

  async getMyLeaveRequests(employee: any) {

    try {
      const leaveRequest = await this.repo.find({
        where: { employee: { id: employee } },
        relations: ['leaveType'],
        order: { start_date: 'DESC' },
      });
      return leaveRequest;
    } catch (error) {
      console.error('Error fetching leave history:', error);
      throw new Error('Could not fetch leave history.');
    }
  }

  async updateStatus(leaveRequestId: string, role: string, decision: string) {
    const leaveRequestRepo = dataSource.getRepository(LeaveRequest);
    try {
      const leaveRequest = await leaveRequestRepo.findOne({ where: { id: leaveRequestId } });

      console.log(role)
      if (!leaveRequest) {
        throw new Error("Leave request not found");
      }

      if (decision == "Approve" && role == "Manager") {
        leaveRequest.manager_approval = "Approved";
      } else if (decision == "Approve" && role == "HR") {
        leaveRequest.HR_approval = "Approved";
      } else if (decision == "Approve" && role == "Director") {
        leaveRequest.director_approval = "Approved";
      }

      if (decision == "Reject" && role == "Manager") {
        leaveRequest.manager_approval = "Rejected";
      } else if (decision == "Reject" && role == "HR") {
        leaveRequest.HR_approval = "Rejected";
      } else if (decision == "Reject" && role == "Director") {
        leaveRequest.director_approval = "Rejected";
      }


      if (leaveRequest.HR_approval == "Approved" && leaveRequest.director_approval == "Approved" && leaveRequest.manager_approval == "Approved") {
        leaveRequest.status = "Approved";
      }

      if(leaveRequest.HR_approval == "Rejected" || leaveRequest.director_approval == "Rejected" || leaveRequest.manager_approval == "Rejected"){
        leaveRequest.status = "Rejected"
      }


      await leaveRequestRepo.save(leaveRequest);

      return ({ message: 'Leave approved successfully' });
    } catch (error) {
      console.error('Error approving leave:', error);
      return ({ message: 'Failed to approve leave', error })
    }
  }


  async getRequestsByRole(role: string, eId: string) {
    try {
      const employeeRepo = dataSource.getRepository(Employee)
      let employees = [];

      if (role == "Manager") {
        employees = await employeeRepo.find({
          where: { manager: { id: eId } },
          relations: ['manager']
        });
      } else if (role == "HR") {
        employees = await employeeRepo.find({
          where: { HR: { id: eId } },
          relations: ['HR']
        });
      }

      const leaveRequests = [];

      for (const e of employees) {
        const leaveHistory = await this.getMyLeaveRequests(e.id);
        leaveRequests.push({
          employee: e,
          leaveHistory,
        });
      }

      return leaveRequests;
    } catch (e) {
      console.log(e)
    }

  }
}
