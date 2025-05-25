import { dataSource } from '../../config/db/conn';
import { LeaveType } from './leave-type-model';

export class LeaveTypeService {
  private repo = dataSource.getRepository(LeaveType);

  async getAllLeaveTypes(): Promise<LeaveType[]> {
    try {
      return await this.repo.find();
    } catch (error) {
      console.error('Error retrieving leave types:', error);
      throw new Error('Could not retrieve leave types');
    }
  }

  async findByType(name: string): Promise<LeaveType | null> {
    try {
      return await this.repo.findOne({
        where: { name },
      });
    } catch (error) {
      console.error('Error finding leave type by name:', error);
      throw new Error('Error retrieving leave type');
    }
  }
}
