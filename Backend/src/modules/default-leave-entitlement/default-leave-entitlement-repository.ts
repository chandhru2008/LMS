import { dataSource } from '../../config/db/conn';
import { DefaultLeaveEntitlement } from './default-leave-entitlement-model';

export class DefaultLeaveEntitlementRepository {
  private repo = dataSource.getRepository(DefaultLeaveEntitlement);

  async findByRole(role: string): Promise<DefaultLeaveEntitlement[]> {
    try {
      return await this.repo.find({
        where: { role },
        relations: ['leaveType'],
      });
    } catch (error) {
      throw new Error('Error retrieving default leave entitlements');
    }
  }

  async findAll(): Promise<DefaultLeaveEntitlement[]> {
    return await this.repo.find({ relations: ['leaveType'] });
  }
}
