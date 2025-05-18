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
exports.EmployeeController = void 0;
const jwtUtil_1 = require("../../utils/jwtUtil");
class EmployeeController {
    constructor(employeeService, leaveBalanceController) {
        this.employeeService = employeeService;
        this.leaveBalanceController = leaveBalanceController;
    }
    registerEmployee(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employeeData = request.payload;
                console.log("Employee data", employeeData);
                const newEmployee = yield this.employeeService.registerEmployee(employeeData);
                const JWTToken = (0, jwtUtil_1.generateJWTToken)(newEmployee);
                yield this.leaveBalanceController.assignDefaultLeaveBalances(newEmployee);
                // Setting cookie
                h.state('userSession', {
                    token: JWTToken,
                });
                return h.response({
                    message: 'Employee registered successfully',
                    JWTToken,
                }).code(201);
            }
            catch (e) {
                console.error(e);
                return h.response({ message: 'Registration failed', error: e }).code(400);
            }
        });
    }
    loginEmployee(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('inibviygcuitfcudrxdysftdxsaz');
                const loginEmployeeData = request.payload;
                console.log("This is login employee data : ", loginEmployeeData);
                const employee = yield this.employeeService.loginEmployee(loginEmployeeData);
                const JWTToken = (0, jwtUtil_1.generateJWTToken)(employee);
                console.log(JWTToken);
                h.state('userSession', {
                    token: JWTToken,
                });
                return h.response({
                    message: 'Login successful',
                    JWTToken,
                }).code(200);
            }
            catch (e) {
                console.log(e);
                return h.response({ message: 'Login failed', error: e }).code(400);
            }
        });
    }
    authenticateEmployee(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = request.state.userSession.token;
                if (!token) {
                    return h.response({ message: 'JWT token must be provided- token' }).code(400);
                }
                const varifyEmployee = (0, jwtUtil_1.verifyToken)(token);
                console.log(varifyEmployee);
                return h.response({
                    employeeName: varifyEmployee.payload.name,
                    role: varifyEmployee.payload.role
                });
            }
            catch (e) {
                console.log("Error in verifying:", e);
                return h.response({ message: 'Login failed', error: e }).code(400);
            }
        });
    }
}
exports.EmployeeController = EmployeeController;
