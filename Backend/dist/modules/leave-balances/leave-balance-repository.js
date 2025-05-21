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
exports.LeaveBalanceRepository = void 0;
const conn_1 = require("../../config/db/conn");
const leave_balance_model_1 = require("./leave-balance-model");
class LeaveBalanceRepository {
    constructor() {
        this.repo = conn_1.dataSource.getRepository(leave_balance_model_1.LeaveBalance);
    }
    // Save multiple leave balance entries
    storeDefaultLeaveBalances(leaveBalanceRecord) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Create a new leave balance record
                const leaveBalance = this.repo.create(leaveBalanceRecord);
                // Save it to the database
                yield this.repo.save(leaveBalance);
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    fetchEmployeeLeaveBalance(employeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const leaveBalance = yield this.repo.find({
                    where: { employee: { id: employeeData.id } },
                    relations: ['employee', 'leaveType']
                });
                const data = leaveBalance.map((item) => ({
                    type: item.leaveType.name,
                    used: item.used_leaves,
                    remaining: item.remaining_leaves,
                    maxDaysAllowed: item.leaveType.max_allowed_days
                }));
                return data;
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
}
exports.LeaveBalanceRepository = LeaveBalanceRepository;
