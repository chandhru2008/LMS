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
        relations: ['employee', 'leaveType', 'approvals'],
      });
     
      return allLeaveRequest;
    } catch (e) {
      console.log(e);
    }

  }

  async getMyLeaveRequests(employee: any) {

    try {
      const leaveRequest = await this.repo.find({
        where: { employee: { id: employee } },
        relations: ['leaveType', 'approvals'],
        order: { start_date: 'DESC' },
      });

      return leaveRequest;

    } catch (error) {
      console.error('Error fetching leave history:', error);
      throw new Error('Could not fetch leave history.');
    }
  }

  


  async getRequestsByRole(role: string, eId: string) {
    try {
      const employeeRepo = dataSource.getRepository(Employee)
      let employees: any = [];

      if (role == "manager") {
        employees = await employeeRepo.find({
          where: { manager: { id: eId } },
          relations: ['manager']
        });
      } else if (role == "HR") {
        employees = await employeeRepo.find({
          where: { hr: { id: eId } },
          relations: ['hr']
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

  async findById(id: string): Promise<LeaveRequest | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ['employee', 'leaveType', 'approvals'], // include relations if needed
    });
  }

  async updateStatusByUser(id: string, status: "Cancelled"): Promise<LeaveRequest> {
    await this.repo.update(id, { status });
    return this.findById(id) as Promise<LeaveRequest>;
  }
}
