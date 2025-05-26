"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveBalanceService = void 0;
const conn_1 = require("../../config/db/conn");
const leave_balance_model_1 = require("./leave-balance-model");
class LeaveBalanceService {
    constructor(defaultLeaveEntitlementService) {
        this.repo = conn_1.dataSource.getRepository(leave_balance_model_1.LeaveBalance);
        this.defaultLeaveEntitlementService = defaultLeaveEntitlementService;
    }
    // Assign default leave balances to an employee
    assignDefaultLeaveBalances(employeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const role = (_a = employeeData.role) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (!role) {
                    throw new Error('Role is missing in employee data');
                }
                const defaultEntitlements = yield this.defaultLeaveEntitlementService.getEntitlementsByRole(role);
                for (let entitlement of defaultEntitlements) {
                    const leaveBalance = new leave_balance_model_1.LeaveBalance();
                    leaveBalance.employee = employeeData;
                    leaveBalance.leaveType = entitlement.leaveType;
                    leaveBalance.used_leaves = 0;
                    leaveBalance.total = entitlement.defaultDays;
                    leaveBalance.remaining_leaves = (_b = entitlement.defaultDays) !== null && _b !== void 0 ? _b : 9999;
                    const newRecord = this.repo.create(leaveBalance);
                    yield this.repo.save(newRecord);
                }
            }
            catch (e) {
                throw new Error(`Failed to assign leave balances: ${e.message}`);
            }
        });
    }
    // Get leave balance for an employee
    fetchEmployeeLeaveBalance(employeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const leaveBalance = yield this.repo.find({
                    where: { employee: { id: employeeData.id } },
                    relations: ['employee', 'leaveType'],
                });
                return leaveBalance.map(item => ({
                    type: item.leaveType.name,
                    used: item.used_leaves,
                    remaining: item.remaining_leaves,
                    total: item.total,
                }));
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
}
exports.LeaveBalanceService = LeaveBalanceService;
