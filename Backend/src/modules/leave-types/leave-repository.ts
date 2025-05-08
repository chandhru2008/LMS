// repository/leave-type-repository.ts
import { dataSource } from '../../config/db/conn';
import { LeaveType } from './leave-type-model';

export class LeaveTypeRepository {

  private repo = dataSource.getRepository(LeaveType);


  async findAll(): Promise<LeaveType[]> {
    try {
      const data =  await this.repo.find();
      console.log(data)
      return data;
    } catch (error) {
      console.error('Error retrieving leave types:', error);
      throw new Error('Could not retrieve leave types');
    }
  }
}
