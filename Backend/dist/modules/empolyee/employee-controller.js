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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const jwtUtil_1 = require("../../utils/jwtUtil");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class EmployeeController {
    constructor(employeeService, leaveBalanceController) {
        this.employeeService = employeeService;
        this.leaveBalanceController = leaveBalanceController;
        this.jwtSecret = process.env.JWT_SECRET || '';
    }
    getTokenFromRequest(request) {
        var _a;
        return ((_a = request.state.userSession) === null || _a === void 0 ? void 0 : _a.token) || null;
    }
    verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, this.jwtSecret);
    }
    handleError(h, error, defaultMessage = 'Internal server error') {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return h.response({ message: 'Invalid or expired token' }).code(401);
        }
        console.error('Error in controller:', error);
        return h.response({ message: error.message || defaultMessage }).code(400);
    }
    registerEmployee(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const token = this.getTokenFromRequest(request);
                if (!token) {
                    return h.response({ message: 'JWT token must be provided' }).code(400);
                }
                const decoded = this.verifyToken(token);
                const role = (_b = (_a = decoded.payload) === null || _a === void 0 ? void 0 : _a.role) === null || _b === void 0 ? void 0 : _b.toLowerCase();
                if (role === 'hr' || role === 'hr_manager') {
                    const employeeData = request.payload;
                    const newEmployee = yield this.employeeService.registerEmployee(employeeData);
                    yield this.leaveBalanceController.assignDefaultLeaveBalances(newEmployee);
                    return h.response({ message: 'Employee registered successfully' }).code(200);
                }
                return h.response({ message: 'Unauthorized user' }).code(401);
            }
            catch (error) {
                return this.handleError(h, error);
            }
        });
    }
    loginEmployee(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = request.payload;
                const employee = yield this.employeeService.loginEmployee({ email, password });
                const JWTToken = (0, jwtUtil_1.generateJWTToken)(employee);
                h.state('userSession', { token: JWTToken });
                return h.response({ message: 'Login successful', JWTToken }).code(200);
            }
            catch (error) {
                if (error.message === "Invalid password" || error.message === 'Employee not found') {
                    return h.response({ message: error.message }).code(400);
                }
                console.error('Login error:', error);
                return h.response({ message: "There is something wrong with backend" }).code(400);
            }
        });
    }
    authenticateEmployee(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const token = this.getTokenFromRequest(request);
                if (!token) {
                    return h.response({ message: 'JWT token must be provided' }).code(400);
                }
                const verifiedEmployee = this.verifyToken(token);
                return h.response({
                    employeeName: (_a = verifiedEmployee.payload) === null || _a === void 0 ? void 0 : _a.name,
                    role: (_b = verifiedEmployee.payload) === null || _b === void 0 ? void 0 : _b.role,
                }).code(200);
            }
            catch (error) {
                return this.handleError(h, error);
            }
        });
    }
    getAllEmployee(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = this.getTokenFromRequest(request);
            if (!token) {
                return h.response({ message: 'JWT token must be provided' }).code(400);
            }
            const verifiedEmployee = this.verifyToken(token);
            if (verifiedEmployee.payload.role === 'HR' || verifiedEmployee.payload.role === 'director') {
                const allEmployee = yield this.employeeService.getAllEmployee();
                return h.response(allEmployee).code(200);
            }
            else {
                return h.response({ message: 'Unauthorized user' }).code(400);
            }
        });
    }
    getEmployeeByRole(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = this.getTokenFromRequest(request);
            if (!token) {
                return h.response({ message: 'JWT token must be provided' }).code(400);
            }
            const verifiedEmployee = this.verifyToken(token);
            console.log(verifiedEmployee);
            if (verifiedEmployee.payload.role === 'manager' || verifiedEmployee.payload.role === 'hr_manager') {
                const id = verifiedEmployee.payload.id;
                const role = verifiedEmployee.payload.role;
                console.log(id, role);
                const getemployeeByRole = yield this.employeeService.getEmployeeByRole(id, role);
                return h.response(getemployeeByRole).code(200);
            }
            else {
                return h.response({ message: 'Unauthorized user' }).code(400);
            }
        });
    }
}
exports.EmployeeController = EmployeeController;
