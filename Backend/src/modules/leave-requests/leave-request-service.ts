import { dataSource } from '../../config/db/conn';
import { LeaveRequest } from './leave-request-entity';
import { LeaveType } from '../leave-types/leave-type-model';
import { Employee } from '../empolyee/employee-entity';
import { LeaveBalance } from '../leave-balances/leave-balance-entity';
import { LeaveApproval } from '../leave-approval/leave-approval-entity';
import { In, Repository } from 'typeorm';

export class LeaveRequestService {
  private leaveRequestRepo: Repository<LeaveRequest>;
  private employeeRepo: Repository<Employee>;
  private leaveTypeRepo: Repository<LeaveType>;
  private leaveApprovalRepo: Repository<LeaveApproval>;
  private leaveBalanceRepo: Repository<LeaveBalance>;

  constructor() {
    this.leaveRequestRepo = dataSource.getRepository(LeaveRequest);
    this.employeeRepo = dataSource.getRepository(Employee);
    this.leaveTypeRepo = dataSource.getRepository(LeaveType);
    this.leaveApprovalRepo = dataSource.getRepository(LeaveApproval);
    this.leaveBalanceRepo = dataSource.getRepository(LeaveBalance);
  }

  async getAllLeaveRequests() {
    const allLeaveRequests = await this.leaveRequestRepo.find({
      relations: ['employee', 'leaveType', 'approvals'],
    });

    if (!allLeaveRequests) throw new Error('Error in fetching leave requests');

    return allLeaveRequests.map(req => ({
      id: req.id,
      description: req.description,
      status: req.status,
      start_date: req.start_date,
      end_date: req.end_date,
      created_at: req.created_at,
      employee: {
        name: req.employee.name,
        email: req.employee.email,
      },
      leaveType: {
        id: req.leaveType.id,
        name: req.leaveType.name,
      },
      approvals: req.approvals.map(appr => ({
        id: appr.id,
        level: appr.level,
        approverRole: appr.approverRole,
        status: appr.status,
        approvedAt: appr.approvedAt,
      })),
    }));
  }

  async getAllLeaveRequestsByRole(role: string, id: string) {

    let employees: Employee[] = [];
    if (role === 'hr_manager') {
      employees = await this.employeeRepo.find({
        where: {
          hrManager: { id: id }
        }
      });
    } else if (role === 'manager') {
      employees = await this.employeeRepo.find({
        where: {
          manager: { id: id }
        }
      });

    }



    const leaveRequests = [];

    for (const employee of employees) {
      const requests = await this.leaveRequestRepo.find({
        where: { employee: { id: employee.id } },
        relations: ['employee', 'leaveType', 'approvals'],
      });

      if (requests) {

        leaveRequests.push(...requests);
      }
    }

    return leaveRequests.map((req) => ({
      id: req.id,
      description: req.description,
      status: req.status,
      start_date: req.start_date,
      end_date: req.end_date,
      created_at: req.created_at,
      employee: {
        name: req.employee.name,
        email: req.employee.email,
      },
      leaveType: {
        id: req.leaveType.id,
        name: req.leaveType.name,
      },
      approvals: req.approvals.map((appr) => ({
        id: appr.id,
        level: appr.level,
        approverRole: appr.approverRole,
        status: appr.status,
        approvedAt: appr.approvedAt,
      })),
    }));
  }


  async getMyLeaveRequests(employeeId: string) {
    return await this.leaveRequestRepo.find({
      where: { employee: { id: employeeId } },
      relations: ['leaveType', 'approvals'],
      order: { start_date: 'DESC' },
    });
  }

  async findById(id: string) {
    return await this.leaveRequestRepo.findOne({
      where: { id },
      relations: ['employee', 'leaveType', 'approvals'],
    });
  }

  async updateStatusByUser(id: string, status: 'Cancelled') {
    await this.leaveRequestRepo.update(id, { status });
    return this.findById(id);
  }

  async cancelLeaveRequest(leaveRequestId: string, eId: string) {
    const leave = await this.findById(leaveRequestId);

    if (!leave) throw new Error('Leave request not found.');
    if (leave.employee.id !== eId) throw new Error('Not authorized.');
    if (leave.status !== 'Pending') throw new Error('Only pending leave requests can be cancelled.');

    const now = new Date();
    const leaveStart = new Date(leave.start_date);
    if (leaveStart <= now) throw new Error('Cannot cancel leave that has started.');

    return await this.updateStatusByUser(leaveRequestId, 'Cancelled');
  }

  async createLeaveRequest(data: any) {
    const {
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      description,
      status,
      employeeRole,
    } = data;

    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
      relations: ['manager', 'hrManager'],
    });

    if (!employee) throw new Error('Employee not found');

    const leaveType = await this.leaveTypeRepo.findOneBy({ id: leaveTypeId });
    if (!leaveType) throw new Error('Leave Type not found');

    const existingLeaves = await this.leaveRequestRepo.find({
      where: {
        employee: { id: employeeId },
        status: In(['Pending', 'Approved']),
      },
    });

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    if (newEnd < new Date()) {
      throw new Error('Cannot apply leave for past dates.');
    }

    // --- Weekend validation logic ---
    function isWeekend(date: Date): boolean {
      const day = date.getDay(); // Sunday = 0, Saturday = 6
      return day === 0 || day === 6;
    }

    const datesInRange: Date[] = [];
    let current = new Date(newStart);
    while (current <= newEnd) {
      datesInRange.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    if (datesInRange.every(isWeekend)) {
      throw new Error('Cannot request leave only for weekends.');
    }

    if (isWeekend(newStart) || isWeekend(newEnd)) {
      throw new Error('Start or end date cannot fall on a weekend.');
    }

    // --- Overlap check ---
    for (const leave of existingLeaves) {
      const existingStart = new Date(leave.start_date);
      const existingEnd = new Date(leave.end_date);
      if (newStart <= existingEnd && newEnd >= existingStart) {
        throw new Error('Leave request overlaps with an existing leave.');
      }
    }

    // Leave days excluding weekends
    const leaveDays = datesInRange.filter(date => !isWeekend(date)).length;

    const leaveBalance = await this.leaveBalanceRepo.findOne({
      where: {
        employee: { id: employee.id },
        leaveType: { id: leaveType.id },
      },
    });

    if (!leaveBalance) throw new Error('Leave balance not found');

    // Emergency Leave auto approval
    if (leaveType.name === 'Emergency Leave') {
      if (leaveBalance.remaining_leaves < leaveDays) {
        throw new Error('Insufficient Emergency Leave balance.');
      }

      const leaveRequest = this.leaveRequestRepo.create({
        employee,
        leaveType,
        start_date: startDate,
        end_date: endDate,
        description,
        status: 'Approved',
      });

      await this.leaveRequestRepo.save(leaveRequest);

      leaveBalance.remaining_leaves -= leaveDays;
      leaveBalance.used_leaves += leaveDays;
      await this.leaveBalanceRepo.save(leaveBalance);

      return 'Emergency leave auto-approved successfully.';
    }

    if (leaveBalance.remaining_leaves < leaveDays) {
      throw new Error('Insufficient leave balance');
    }

    const leaveRequest = this.leaveRequestRepo.create({
      employee,
      leaveType,
      start_date: startDate,
      end_date: endDate,
      description,
      status,
    });

    const savedLeaveRequest = await this.leaveRequestRepo.save(leaveRequest);

    // Approval logic
    const approvals = [];

    if (employeeRole === 'employee') {
      const managerId = employee.manager?.id;
      if (!managerId) throw new Error('Manager not assigned');

      if (leaveDays < 3) {
        approvals.push({ level: 1, approverRole: 'manager', approverId: managerId });
      } else if (leaveDays < 7) {
        approvals.push(
          { level: 1, approverRole: 'manager', approverId: managerId },
          { level: 2, approverRole: 'hr' }
        );
      } else {
        approvals.push(
          { level: 1, approverRole: 'manager', approverId: managerId },
          { level: 2, approverRole: 'director' },
          { level: 3, approverRole: 'hr' }
        );
      }
    } else if (employeeRole === 'manager') {
      approvals.push(
        ...(leaveDays < 3
          ? [{ level: 1, approverRole: 'hr' }]
          : [
            { level: 1, approverRole: 'director' },
            { level: 2, approverRole: 'hr' },
          ])
      );
    } else if (employeeRole === 'hr') {
      const hrManagerId = employee.hrManager?.id;
      if (!hrManagerId) {
        throw new Error('HR manager not found');
      }
      approvals.push(
        ...(leaveDays < 3
          ? [{ level: 1, approverRole: 'hr_manager', approverId: hrManagerId }]
          : [
            { level: 1, approverRole: 'hr_manager', approverId: hrManagerId },
            { level: 2, approverRole: 'director' },
          ])
      );
    } else if (employeeRole === 'hr_manager') {
      approvals.push({ level: 1, approverRole: 'director' });
    }

    for (const approval of approvals) {
      const leaveApproval = this.leaveApprovalRepo.create({
        leaveRequest: savedLeaveRequest,
        level: approval.level,
        approverRole: approval.approverRole,
        status: 'Pending',
        approver: approval.approverId
          ? { id: approval.approverId } as Employee
          : undefined,
      });

      await this.leaveApprovalRepo.save(leaveApproval);
    }

    return 'Leave request submitted successfully and pending approvals.';
  }

}
