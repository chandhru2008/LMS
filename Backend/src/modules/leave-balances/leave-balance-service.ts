import { LeaveBalanceRepository } from "./leave-balance-repository";
import { LeaveBalance } from "./leave-balance-model";
import { DefaultLeaveEntitlementRepository } from "../default-leave-entitlement/default-leave-entitlement-repository";

export class LeaveBalanceService {
    private leaveBalanceRepository: LeaveBalanceRepository;
    private defaultLeaveEntitlementRepository: DefaultLeaveEntitlementRepository

    constructor(
        leaveBalanceRepository: LeaveBalanceRepository,
        defaultLeaveEntitlementRepository: DefaultLeaveEntitlementRepository

    ) {
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.defaultLeaveEntitlementRepository = defaultLeaveEntitlementRepository
    }

    // Assignign default leave balances to an employee
    async assignDefaultLeaveBalances(employeeData: any) {
        try {
            const role = employeeData.role?.toLowerCase();
            if (!role) {
                throw new Error("Role is missing in employee data");
            }
           
            // Get default entitlements based on role
            const defaultEntitlements = await this.defaultLeaveEntitlementRepository.findByRole(role);

            for (let entitlement of defaultEntitlements) {
                const leaveBalance = new LeaveBalance();
                leaveBalance.employee = employeeData;
                leaveBalance.leaveType = entitlement.leaveType;
                leaveBalance.used_leaves = 0;

                leaveBalance.total = entitlement.defaultDays

                // If defaultDays is null (like for director), you can choose a logic here
                leaveBalance.remaining_leaves = entitlement.defaultDays ?? 9999;

                await this.leaveBalanceRepository.storeDefaultLeaveBalances(leaveBalance);
            }
        } catch (e: any) {
            throw new Error(`Failed to assign leave balances: ${e.message}`);
        }
    }


    async fetchEmployeeLeaveBalance(employeeData: any) {
        try {
            const leaveBalance = await this.leaveBalanceRepository.fetchEmployeeLeaveBalance(employeeData);
            return leaveBalance;
        } catch (e: any) {
            throw new Error(e.message);
        }

    }
}
