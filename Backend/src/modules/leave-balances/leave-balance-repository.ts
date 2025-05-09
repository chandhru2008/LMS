import { dataSource } from '../../config/db/conn';
import { Employee } from '../empolyee/employee-model';
import { LeaveBalance } from './leave-balance-model';


export class LeaveBalanceRepository {
    private repo = dataSource.getRepository(LeaveBalance);

    // Save multiple leave balance entries
    async storeDefaultLeaveBalances(leaveBalanceRecord: LeaveBalance) {
        try {
            // Create a new leave balance record
            console.log("Leave balance saved coming.");
            const leaveBalance = this.repo.create(leaveBalanceRecord);
            console.log("THis is leave balance", leaveBalance)

            // Save it to the database
            await this.repo.save(leaveBalance);
            console.log("Leave balance saved successfully.");
        } catch (error) {
            console.error("Error saving leave balance:", error);
            throw error;
        }
    }

    async fetchEmployeeLeaveBalance(employeeData : any) {
        try{
            console.log("Employee in repo ", employeeData)
            const leaveBalance = await this.repo.find({
                where: { employee: { id: employeeData.id } },
                relations: ['employee', 'leaveType'] 
              });

              console.log(leaveBalance);

              const data = leaveBalance.map((item) => ({
                type: item.leaveType.name,
                used: item.used_leaves,
                remaining: item.remaining_leaves
              }));

              console.log(data);
           
            return data;
        }catch(e){
            console.log("Error : ", e);
        }

    }
}
