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
    data: any
  ) {
    
    try {
      console.log("Description in repo leayer", data.description)
      const employeeRepo = dataSource.getRepository(Employee);
      const leaveTypeRepo = dataSource.getRepository(LeaveType);

      const employeeId = data.employeeId;
      const leaveTypeName = data.leaveType

      const employee = await employeeRepo.findOneBy({ id: employeeId });
      const leaveType = await leaveTypeRepo.findOneBy({ name: leaveTypeName });

      if (!employee) throw new Error("Employee not found");
      if (!leaveType) throw new Error("Leave Type not found");

      const leaveRequest = new LeaveRequest();
      leaveRequest.employee = employee;
      leaveRequest.leaveType = leaveType;
      leaveRequest.start_date = data.startDate
      leaveRequest.end_date = data.endDate
      leaveRequest.description = data.description
      leaveRequest.status = 'Pending';

      return await this.repo.save(leaveRequest);
    } catch (e) {
      console.log("Error : ", e)
    }

  }

  async getLeaveHistory(employee: any) {


    try {
      const leaveHistory = await this.repo.find({
        where: { employee: {id : employee}},
        relations: ['leaveType'],
        order: { start_date: 'DESC' },
        
      });
      console.log("This is leave history", leaveHistory)
      return leaveHistory;
    } catch (error) {
      console.error('Error fetching leave history:', error);
      throw new Error('Could not fetch leave history.');
    }
  }


}
