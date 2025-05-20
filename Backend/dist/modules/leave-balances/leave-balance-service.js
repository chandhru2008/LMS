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
const leave_balance_model_1 = require("./leave-balance-model");
class LeaveBalanceService {
    constructor(leaveBalanceRepository, leaveTypeRepository) {
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveTypeRepository = leaveTypeRepository;
    }
    // Assignign default leave balances to an employee
    assignDefaultLeaveBalances(employeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Geting  all leave types
                const allLeaveTypes = yield this.leaveTypeRepository.findAll();
                // Loop through each leave type and create a leave balance entry
                for (let leaveType of allLeaveTypes) {
                    const leaveBalance = new leave_balance_model_1.LeaveBalance();
                    leaveBalance.employee = employeeData;
                    leaveBalance.leaveType = leaveType;
                    leaveBalance.used_leaves = 0;
                    leaveBalance.remaining_leaves = 10;
                    // Saving  the leave balance entry
                    yield this.leaveBalanceRepository.storeDefaultLeaveBalances(leaveBalance);
                    console.log(leaveBalance);
                }
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
    fetchEmployeeLeaveBalance(employeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const leaveBalance = yield this.leaveBalanceRepository.fetchEmployeeLeaveBalance(employeeData);
                return leaveBalance;
            }
            catch (e) {
                console.log("Error in serivice :", e);
            }
        });
    }
}
exports.LeaveBalanceService = LeaveBalanceService;
