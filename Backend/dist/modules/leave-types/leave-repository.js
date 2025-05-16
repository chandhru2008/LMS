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
exports.LeaveTypeRepository = void 0;
// repository/leave-type-repository.ts
const conn_1 = require("../../config/db/conn");
const leave_type_model_1 = require("./leave-type-model");
class LeaveTypeRepository {
    constructor() {
        this.repo = conn_1.dataSource.getRepository(leave_type_model_1.LeaveType);
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.repo.find();
                console.log(data);
                return data;
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
                console.error('Error finding employee by email:', error);
                throw new Error('Error retrieving employee data');
            }
        });
    }
}
exports.LeaveTypeRepository = LeaveTypeRepository;
