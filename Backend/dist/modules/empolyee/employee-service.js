"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.EmployeeService = void 0;
const conn_1 = require("../../config/db/conn");
const employee_entity_1 = require("./employee-entity");
const bcrypt = __importStar(require("bcrypt"));
class EmployeeService {
    constructor(leaveBalanceService) {
        this.repo = conn_1.dataSource.getRepository(employee_entity_1.Employee);
        this.leaveBalanceService = leaveBalanceService;
    }
    // Find employee by email
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repo.findOne({ where: { email } });
            }
            catch (error) {
                throw new Error('Error retrieving employee data');
            }
        });
    }
    // Create a new employee record with business validation
    registerEmployee(employeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(employeeData.email)) {
                    throw new Error("Enter a valid email");
                }
                const existingEmployee = yield this.findByEmail(employeeData.email);
                if (existingEmployee) {
                    throw new Error("Email already exists");
                }
                const role = employeeData.role.toLowerCase();
                // Supervisor emails 
                const managerEmail = (_a = employeeData.managerEmail) === null || _a === void 0 ? void 0 : _a.trim();
                const hrManagerEmail = (_b = employeeData.hrManagerEmail) === null || _b === void 0 ? void 0 : _b.trim();
                // Lookup supervisors
                const manager = managerEmail ? yield this.findByEmail(managerEmail) : null;
                const hrManager = hrManagerEmail ? yield this.findByEmail(hrManagerEmail) : null;
                // Validation based on role
                if (role === 'employee') {
                    if (!manager)
                        throw new Error("Manager does not exist");
                }
                else if (role === 'hr') {
                    if (!hrManager)
                        throw new Error("HR Manager does not exist");
                }
                else if (role === 'hr_manager' || role === 'director' || role === 'manager') {
                    // No supervisor required
                }
                else {
                    throw new Error("Invalid role");
                }
                // Create employee entity
                const employee = new employee_entity_1.Employee();
                employee.name = employeeData.name;
                employee.email = employeeData.email;
                employee.gender = employeeData.gender;
                employee.maritalStatus = employeeData.materialStatus;
                employee.password = yield bcrypt.hash(employeeData.password, 10);
                employee.role = role;
                // Set supervisor relations
                if (role === 'employee') {
                    employee.manager = manager;
                }
                else if (role === 'hr') {
                    employee.hrManager = hrManager;
                }
                const newEmployee = yield this.repo.save(employee);
                yield this.leaveBalanceService.assignDefaultLeaveBalances(newEmployee);
                return newEmployee;
            }
            catch (e) {
                console.log("Error in registering employee :", e);
                throw new Error(e.message);
            }
        });
    }
    // Login employee
    loginEmployee(loginEmployeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employee = yield this.findByEmail(loginEmployeeData.email);
                if (!employee) {
                    throw new Error('Employee not found');
                }
                const isPasswordValid = yield bcrypt.compare(loginEmployeeData.password, employee.password);
                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }
                return employee;
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
    getAllEmployee() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repo.find();
        });
    }
    getEmployeeByRole(id, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (role === 'manager') {
                    return yield this.repo.find({ where: { manager: { id: id } } });
                }
                else if (role === 'hr_manager') {
                    return yield this.repo.find({ where: { hrManager: { id: id } } });
                }
            }
            catch (e) {
                console.log("Error in getting employees by role : ", e);
            }
        });
    }
    getAllManagers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repo.find({ where: { role: 'manager' } });
            }
            catch (e) {
                console.log(e);
                throw new Error(e);
            }
        });
    }
    getAllHrManagers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repo.find({ where: { role: 'hr_manager' } });
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
}
exports.EmployeeService = EmployeeService;
