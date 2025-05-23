// services/leave-type-service.ts
import { LeaveTypeRepository } from './leave-type-repository';
import { LeaveType } from './leave-type-model';

export class LeaveTypeService {

    private leaveTypeRepo : LeaveTypeRepository
  constructor(leaveTypeRepo: LeaveTypeRepository) {
    this.leaveTypeRepo = leaveTypeRepo;
  }

  async getAllLeaveTypes() {
    return this.leaveTypeRepo.findAll();
  }

}
