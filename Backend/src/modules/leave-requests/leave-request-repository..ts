import { dataSource } from '../../config/db/conn';
import { LeaveRequest } from './leave-request-model';
import { LeaveType } from '../leave-types/leave-type-model';
import { Employee } from '../empolyee/employee-model';
import { Repository } from 'typeorm';

export class LeaveRequestRepository {
  private repo: Repository<LeaveRequest>;

  constructor() {
    this.repo = dataSource.getRepository(LeaveRequest);
  }

  public async createLeaveRequest(
    employeeId: string,
    leaveTypeId: string,
    startDate: string,
    endDate: string,
    description : string
  ) {
    const employeeRepo = dataSource.getRepository(Employee);
    const leaveTypeRepo = dataSource.getRepository(LeaveType);

    const employee = await employeeRepo.findOneBy({ id: employeeId });
    const leaveType = await leaveTypeRepo.findOneBy({ id: Number(leaveTypeId) });

    if (!employee) throw new Error("Employee not found");
    if (!leaveType) throw new Error("Leave Type not found");

    const leaveRequest = new LeaveRequest();
    leaveRequest.employee = employee;
    leaveRequest.leaveType = leaveType;
    leaveRequest.start_date = startDate
    leaveRequest.end_date = endDate
    leaveRequest.description = description
    leaveRequest.status = 'Pending';

    return await this.repo.save(leaveRequest);
  }

  public async findLeaveRequestById(leaveRequestId: string) {
    return await this.repo.findOne({
      where: { id: leaveRequestId },
      relations: ['employee', 'leaveType'] 
    });
  }
}
