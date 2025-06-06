import { dataSource } from '../../config/db/conn';
import { LeaveRequest } from './leave-request-entity';
import { LeaveType } from '../leave-types/leave-type-model';
import { Employee } from '../empolyee/employee-entity';
import { LeaveBalance } from '../leave-balances/leave-balance-entity';
import { LeaveApproval } from '../leave-approval/leave-approval-entity';
import { In, Repository } from 'typeorm';
import { sendEmail } from '../../mailservice';

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
      relations: ['employee', 'leaveType', 'approvals', 'approvals.employee'],
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
  try {
    const leaveRequests = await this.leaveRequestRepo.find({
      where: { employee: { id: employeeId } },
      relations: ['leaveType', 'approvals', 'approvals.approver'],
      order: { start_date: 'DESC' },
    });

    const filtered = leaveRequests.map(lr => ({
      id: lr.id,
      description: lr.description,
      status: lr.status,
      start_date: lr.start_date,
      end_date: lr.end_date,
      created_at: lr.created_at,
      leaveType: {
        id: lr.leaveType.id,
        name: lr.leaveType.name,
      },
      approvals: lr.approvals.map(appr => ({
        id: appr.id,
        level: appr.level,
        approverRole: appr.approverRole,
        status: appr.status,
        remarks: appr.remarks,
        approvedAt: appr.approvedAt,
        approver: appr.approver
          ? {
              name: appr.approver.name,
              email: appr.approver.email,
              role: appr.approver.role,
            }
          : null,
      })),
    }));

    console.log(filtered);
    return filtered;
  } catch (e) {
    console.log(e);
  }
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
      leaveTypeName,
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

    const leaveType = await this.leaveTypeRepo.findOneBy({ name: leaveTypeName });
    if (!leaveType) throw new Error('Leave Type not found');

    const existingLeaves = await this.leaveRequestRepo.find({
      where: {
        employee: { id: employeeId },
        status: In(['Pending', 'Approved']),
      },
    });

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    if (newEnd < new Date()) throw new Error('Cannot apply leave for past dates.');

    const isWeekend = (date: Date): boolean => [0, 6].includes(date.getDay());

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

    for (const leave of existingLeaves) {
      const existingStart = new Date(leave.start_date);
      const existingEnd = new Date(leave.end_date);
      if (newStart <= existingEnd && newEnd >= existingStart) {
        throw new Error('Leave request overlaps with an existing leave.');
      }
    }

    const leaveDays = datesInRange.filter(date => !isWeekend(date)).length;

    const leaveBalance = await this.leaveBalanceRepo.findOne({
      where: {
        employee: { id: employee.id },
        leaveType: { id: leaveType.id },
      },
    });
    if (!leaveBalance) throw new Error('Leave balance not found');

    const leaveInfo = `${employee.name} applied ${leaveType.name} for ${leaveDays} day(s) from ${startDate} to ${endDate}`;
    const html = `
    <p>Click the button below to open the app:</p>
    <a href="https://lms-zwod.onrender.com" style="padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
      Go to App
    </a>
  `;

    const approvals = [];
    let initialEmails: string[] = [];

    // Emergency Leave auto-approval logic
    if (leaveType.name === 'Emergency Leave') {
      if (leaveBalance.remaining_leaves < leaveDays) {
        throw new Error('Insufficient Emergency Leave balance.');
      }

      const emergencyLeave = this.leaveRequestRepo.create({
        employee,
        leaveType,
        start_date: startDate,
        end_date: endDate,
        description,
        status: 'Approved',
      });
      await this.leaveRequestRepo.save(emergencyLeave);

      leaveBalance.remaining_leaves -= leaveDays;
      leaveBalance.used_leaves += leaveDays;
      await this.leaveBalanceRepo.save(leaveBalance);

      if (employee.manager?.email) {
        sendEmail(employee.manager.email, leaveInfo, description, html);
      }

      return 'Emergency leave auto-approved and email sent to manager.';
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

    // Approval logic based on role
    if (employeeRole === 'employee') {
      const manager = employee.manager;
      if (!manager) throw new Error('Manager not assigned');

      approvals.push({ level: 1, approverRole: 'manager', approverId: manager.id });

      if (leaveDays < 3) {
        initialEmails.push(manager.email);
      } else if (leaveDays < 7) {
        approvals.push({ level: 2, approverRole: 'hr' });
        initialEmails.push(manager.email);
      } else {
        approvals.push(
          { level: 2, approverRole: 'director' },
          { level: 3, approverRole: 'hr' }
        );
        initialEmails.push(manager.email);
      }
    } else if (employeeRole === 'manager') {
      const hrs = await this.employeeRepo.find({ where: { role: 'hr' } });
      const hrEmails = hrs.map(hr => hr.email);

      if (leaveDays < 3) {
        approvals.push({ level: 1, approverRole: 'hr' });
      } else {
        approvals.push(
          { level: 1, approverRole: 'director' },
          { level: 2, approverRole: 'hr' }
        );
      }
      initialEmails = hrEmails;
    } else if (employeeRole === 'hr') {
      const hrManager = employee.hrManager;
      if (!hrManager) throw new Error('HR manager not assigned');

      if (leaveDays < 3) {
        approvals.push({
          level: 1,
          approverRole: 'hr_manager',
          approverId: hrManager.id,
        });
      } else {
        approvals.push(
          { level: 1, approverRole: 'hr_manager', approverId: hrManager.id },
          { level: 2, approverRole: 'director' }
        );
      }
      initialEmails.push(hrManager.email);
    } else if (employeeRole === 'hr_manager') {
      approvals.push({ level: 1, approverRole: 'director' });
      const directors = await this.employeeRepo.find({ where: { role: 'director' } });
      initialEmails = directors.map(d => d.email);
    }

    // Save all approval records
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

    // Send emails only to the first group of approvers
    for (const email of initialEmails) {
      sendEmail(email, leaveInfo, description, html);
    }

    return 'Leave request submitted successfully and email sent to first approver.';
  }


}
