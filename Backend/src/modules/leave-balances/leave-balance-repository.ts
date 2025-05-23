import { dataSource } from '../../config/db/conn';
import { Employee } from '../empolyee/employee-model';
import { LeaveBalance } from './leave-balance-model';


export class LeaveBalanceRepository {
    private repo = dataSource.getRepository(LeaveBalance);

    // Save multiple leave balance entries
    async storeDefaultLeaveBalances(leaveBalanceRecord: LeaveBalance) {
        try {
            // Create a new leave balance record
            const leaveBalance = this.repo.create(leaveBalanceRecord);

            // Save it to the database
            await this.repo.save(leaveBalance);

        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async fetchEmployeeLeaveBalance(employeeData: any) {
        try {

            const leaveBalance = await this.repo.find({
                where: { employee: { id: employeeData.id } },
                relations: ['employee', 'leaveType']
            });

            const data = leaveBalance.map((item) => ({
                type: item.leaveType.name,
                used: item.used_leaves,
                remaining: item.remaining_leaves,
                total : item.total
            }));

            return data;

        } catch (e: any) {
            throw new Error(e.message)
        }

    }

}
