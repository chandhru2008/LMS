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
exports.EmployeeRepository = void 0;
const conn_1 = require("../../config/db/conn");
const employee_model_1 = require("./employee-model");
class EmployeeRepository {
    constructor() {
        this.repo = conn_1.dataSource.getRepository(employee_model_1.Employee);
    }
    // Finding the employee records using their email
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repo.findOne({
                    where: { email },
                });
            }
            catch (error) {
                throw new Error('Error retrieving employee data');
            }
        });
    }
    // Creating an employee record in the database
    create(employeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            const employee = this.repo.create(employeeData); // Create a new employee instance
            return yield this.repo.save(employee); // Save the employee to the database
        });
    }
}
exports.EmployeeRepository = EmployeeRepository;
