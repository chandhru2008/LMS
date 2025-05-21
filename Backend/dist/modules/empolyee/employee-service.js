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
const employee_model_1 = require("./employee-model");
const bcrypt = __importStar(require("bcrypt"));
class EmployeeService {
    constructor(employeeRepo) {
        this.employeeRepo = employeeRepo;
    }
    registerEmployee(employeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(employeeData.email)) {
                    throw new Error("Enter a valid email");
                }
                const existingEmployee = yield this.employeeRepo.findByEmail(employeeData.email);
                if (existingEmployee) {
                    throw new Error("Email already exists");
                }
                const role = employeeData.role.toLowerCase();
                // Supervisor emails from frontend
                const managerEmail = (_a = employeeData.managerEmail) === null || _a === void 0 ? void 0 : _a.trim();
                const hrEmail = (_b = employeeData.hrEmail) === null || _b === void 0 ? void 0 : _b.trim();
                const hrManagerEmail = (_c = employeeData.hrManagerEmail) === null || _c === void 0 ? void 0 : _c.trim();
                const directorEmail = (_d = employeeData.directorEmail) === null || _d === void 0 ? void 0 : _d.trim();
                // Lookup supervisors
                const manager = managerEmail ? yield this.employeeRepo.findByEmail(managerEmail) : null;
                const hr = hrEmail ? yield this.employeeRepo.findByEmail(hrEmail) : null;
                const hrManager = hrManagerEmail ? yield this.employeeRepo.findByEmail(hrManagerEmail) : null;
                const director = directorEmail ? yield this.employeeRepo.findByEmail(directorEmail) : null;
                // Validation based on the exact rules you gave
                if (role === 'employee') {
                    if (!manager)
                        throw new Error("Manager does not exist");
                }
                else if (role === 'manager') {
                    if (!hr)
                        throw new Error("HR does not exist");
                }
                else if (role === 'hr') {
                    if (!hrManager)
                        throw new Error("HR Manager does not exist");
                }
                else if (role === 'hr_manager')
                    [
                    //
                    ];
                else if (role === 'director') {
                    // No supervisor required
                }
                else {
                    throw new Error("Invalid role");
                }
                // Create employee entity
                const employee = new employee_model_1.Employee();
                employee.name = employeeData.name;
                employee.email = employeeData.email;
                employee.password = yield bcrypt.hash(employeeData.password, 10);
                employee.role = role;
                // Set supervisor relations based on role
                if (role === 'employee') {
                    employee.manager = manager;
                }
                else if (role === 'manager') {
                    employee.hr = hr;
                }
                else if (role === 'hr') {
                    employee.hrManager = hrManager;
                }
                return yield this.employeeRepo.create(employee);
            }
            catch (e) {
                console.log("Error in service : ", e);
                throw new Error(e.message);
            }
        });
    }
    loginEmployee(loginEmployeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkEmployeeExist = yield this.employeeRepo.findByEmail(loginEmployeeData.email);
                if (!checkEmployeeExist) {
                    throw new Error('Employee not found');
                }
                const isPasswordValid = yield bcrypt.compare(loginEmployeeData.password, checkEmployeeExist.password);
                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }
                return checkEmployeeExist;
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
}
exports.EmployeeService = EmployeeService;
