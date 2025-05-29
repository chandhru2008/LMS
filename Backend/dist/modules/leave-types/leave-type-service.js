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
exports.LeaveTypeService = void 0;
const conn_1 = require("../../config/db/conn");
const leave_type_model_1 = require("./leave-type-model");
class LeaveTypeService {
    constructor() {
        this.repo = conn_1.dataSource.getRepository(leave_type_model_1.LeaveType);
    }
    getAllLeaveTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repo.find();
            }
            catch (error) {
                console.error('Error retrieving leave types:', error);
                throw new Error('Could not retrieve leave types');
            }
        });
    }
    findByType(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repo.findOne({
                    where: { name },
                });
            }
            catch (error) {
                console.error('Error finding leave type by name:', error);
                throw new Error('Error retrieving leave type');
            }
        });
    }
    getLeaveTypeByEligibility(gender, maritalStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const allLeaveTypes = yield this.repo.find();
            const filteredLeaveTypes = allLeaveTypes.filter((leaveType) => {
                const name = leaveType.name.toLowerCase();
                if (name === 'maternity leave' && (gender !== 'female' || maritalStatus !== 'married')) {
                    return false;
                }
                if (name === 'paternity leave' && (gender !== 'male' || maritalStatus !== 'married')) {
                    return false;
                }
                return true;
            });
            return filteredLeaveTypes;
        });
    }
}
exports.LeaveTypeService = LeaveTypeService;
