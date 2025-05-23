// repository/leave-type-repository.ts
import { dataSource } from '../../config/db/conn';
import { LeaveType } from './leave-type-model';

export class LeaveTypeRepository {

  private repo = dataSource.getRepository(LeaveType);


  async findAll(): Promise<LeaveType[]> {
    try {
      const data =  await this.repo.find();
      return data;
    } catch (error) {
      console.error('Error retrieving leave types:', error);
      throw new Error('Could not retrieve leave types');
    }
  }
  async findByType(name : string){
    try {
      return await this.repo.findOne({
          where: { name },
      });
  } catch (error) {
      console.error('Error finding employee by email:', error);
      throw new Error('Error retrieving employee data');
  }
  }
}
