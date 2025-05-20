import { LeaveBalanceRepository } from "./leave-balance-repository";
import { LeaveTypeRepository } from "../leave-types/leave-repository";
import { LeaveType } from "../leave-types/leave-type-model";
import { LeaveBalance } from "./leave-balance-model";

export class LeaveBalanceService {
    private leaveBalanceRepository: LeaveBalanceRepository;
    private leaveTypeRepository: LeaveTypeRepository;


    constructor(
        leaveBalanceRepository: LeaveBalanceRepository,
        leaveTypeRepository: LeaveTypeRepository
    ) {
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveTypeRepository = leaveTypeRepository;
    }

    // Assignign default leave balances to an employee
    async assignDefaultLeaveBalances(employeeData: any) {

        try {
            // Geting  all leave types
            const allLeaveTypes = await this.leaveTypeRepository.findAll();


            // Loop through each leave type and create a leave balance entry
            for (let leaveType of allLeaveTypes) {

                const leaveBalance = new LeaveBalance();


                leaveBalance.employee = employeeData;
                leaveBalance.leaveType = leaveType;


                leaveBalance.used_leaves = 0;
                leaveBalance.remaining_leaves = 10;

                // Saving  the leave balance entry
                await this.leaveBalanceRepository.storeDefaultLeaveBalances(leaveBalance);
                console.log(leaveBalance);
            }

        } catch (e: any) {
            throw new Error(e.message)
        }

    }

    async fetchEmployeeLeaveBalance(employeeData: any) {
        try {
            const leaveBalance = await this.leaveBalanceRepository.fetchEmployeeLeaveBalance(employeeData);
            return leaveBalance;
        } catch (e) {
            console.log("Error in serivice :", e);
        }

    }


}
