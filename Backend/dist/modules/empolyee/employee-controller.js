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
const jwt = require('jsonwebtoken');
class EmployeeController {
    constructor(employeeService, leaveBalanceController) {
        this.employeeService = employeeService;
        this.leaveBalanceController = leaveBalanceController;
    }
    registerEmployee(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const secretKey = process.env.JWT_SECRET;
                const JWTtoken = request.state.userSession.token;
                const decode = jwt.verify(JWTtoken, secretKey);
                const role = decode.payload.role;
                if (role != 'Hr') {
                    return h.response({ message: 'Unauthorized user' }).code(401);
                }
                const employeeData = request.payload;
                const newEmployee = yield this.employeeService.registerEmployee(employeeData);
                yield this.leaveBalanceController.assignDefaultLeaveBalances(newEmployee);
                return h.response({
                    message: 'Employee registered successfully',
                }).code(200);
            }
            catch (e) {
                return h.response({ message: e.message }).code(400);
            }
        });
    }
    //Login 
    loginEmployee(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loginEmployeeData = request.payload;
                const employee = yield this.employeeService.loginEmployee(loginEmployeeData);
                const JWTToken = (0, jwtUtil_1.generateJWTToken)(employee);
                h.state('userSession', { token: JWTToken });
                return h.response({
                    message: 'Login successful',
                    JWTToken,
                }).code(200);
            }
            catch (e) {
                if (e.message === "Invalid password" || e.message === 'Employee not found') {
                    return h.response({ message: e.message }).code(400);
                }
                else {
                    console.log(e.message);
                    return h.response({ message: "There is somethink issue with backend" }).code(400);
                }
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
                return h.response({
                    employeeName: varifyEmployee.payload.name,
                    role: varifyEmployee.payload.role
                }).code(200);
            }
            catch (e) {
                if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
                    return h.response({ message: 'Invalid or expired token' }).code(401);
                }
                return h.response({ message: 'Internal server error', error: e }).code(500);
            }
        });
    }
}
exports.EmployeeController = EmployeeController;
