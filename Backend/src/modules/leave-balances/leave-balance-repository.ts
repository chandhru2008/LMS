import { dataSource } from '../../config/db/conn';
import { LeaveBalance } from './leave-balance-model';


export class LeaveBalanceRepository {
    private repo = dataSource.getRepository(LeaveBalance);

    // Save multiple leave balance entries
    async storeDefaultLeaveBalances(leaveBalanceRecord: LeaveBalance) {
        try {
            // Create a new leave balance record
            console.log("Leave balance saved coming.");
            const leaveBalance = this.repo.create(leaveBalanceRecord);
            console.log("THis is leave balance",leaveBalance)

            // Save it to the database
            await this.repo.save(leaveBalance);
            console.log("Leave balance saved successfully.");
        } catch (error) {
            console.error("Error saving leave balance:", error);
            throw error;
        }
    }
}
