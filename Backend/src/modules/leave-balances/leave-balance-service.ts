import { dataSource } from '../../config/db/conn';
import { LeaveBalance } from './leave-balance-entity';
import { DefaultLeaveEntitlementService } from '../default-leave-entitlement/default-leave-entitlement-service';
import { Employee } from '../empolyee/employee-entity';
import { LeaveType } from '../leave-types/leave-type-model';


export class LeaveBalanceService {
  private repo = dataSource.getRepository(LeaveBalance);
  private defaultLeaveEntitlementService: DefaultLeaveEntitlementService;

  constructor(defaultLeaveEntitlementService: DefaultLeaveEntitlementService) {
    this.defaultLeaveEntitlementService = defaultLeaveEntitlementService;
  }

  // Assign default leave balances to an employee
  async assignDefaultLeaveBalances(employeeData: any) {
    try {
      const role = employeeData.role.toLowerCase();
      if (!role) {
        throw new Error('Role is missing in employee data');
      }

      const defaultEntitlements = await this.defaultLeaveEntitlementService.getEntitlementsByRole(role);

      for (let entitlement of defaultEntitlements) {
        const leaveTypeName = entitlement.leaveType.name.toLowerCase();


        if (
          (leaveTypeName === 'maternity leave' && (employeeData.gender !== 'female' || employeeData.maritalStatus !== 'married')) ||
          (leaveTypeName === 'paternity leave' && (employeeData.gender !== 'male' || employeeData.maritalStatus !== 'married'))
        ) {
          continue;
        }


        const leaveBalance = new LeaveBalance();
        leaveBalance.employee = employeeData;
        leaveBalance.leaveType = entitlement.leaveType;
        leaveBalance.used_leaves = 0;
        leaveBalance.total = entitlement.defaultDays;
        leaveBalance.remaining_leaves = entitlement.defaultDays ?? 9999;

        const newRecord = this.repo.create(leaveBalance);
        await this.repo.save(newRecord);
      }

    } catch (e) {
      throw new Error(`Failed to assign leave balances: ${e.message}`);
    }
  }

  // Get leave balance for an employee
  async fetchEmployeeLeaveBalance(employeeData: any) {
    try {
      const leaveBalance = await this.repo.find({
        where: { employee: { id: employeeData.id } },
        relations: ['employee', 'leaveType'],
      });

      return leaveBalance.map(item => ({
        type: item.leaveType.name,
        used: item.used_leaves,
        remaining: item.remaining_leaves,
        total: item.total,
      }));
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
