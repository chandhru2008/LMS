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
const jwt_util_1 = require("../../common/utils/jwt-util");
const excelWorker_1 = require("../../common/utils/excelWorker");
class EmployeeController {
    constructor(employeeService) {
        this.employeeService = employeeService;
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
            try {
                const employeeData = request.payload;
                yield this.employeeService.registerEmployee(employeeData);
                return h.response({ message: 'Employee registered successfully' }).code(200);
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
                const role = employee.role;
                const JWTToken = (0, jwt_util_1.generateJWTToken)(employee);
                console.log("new  JWT : ", JWTToken);
                h.state('userSession', { token: JWTToken });
                return h.response({ message: 'Login successful', role }).code(200);
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
            try {
                const credentials = request.auth.credentials;
                const name = credentials.payload.name;
                const role = credentials.payload.role;
                const email = credentials.payload.email;
                return h.response({
                    name: name,
                    email: email,
                    role: role,
                }).code(200);
            }
            catch (error) {
                return this.handleError(h, error);
            }
        });
    }
    getAllEmployee(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allEmployees = yield this.employeeService.getAllEmployee();
                return h.response(allEmployees).code(200);
            }
            catch (error) {
                console.error('Get all employees error:', error);
                return h.response({ message: 'Failed to fetch employees' }).code(500);
            }
        });
    }
    getEmployeeByRole(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const credentials = request.auth.credentials;
                const role = credentials.payload.role.toLowerCase();
                const id = credentials.payload.id;
                if (role === 'manager' || role === 'hr_manager') {
                    const getemployeeByRole = yield this.employeeService.getEmployeeByRole(id, role);
                    return h.response(getemployeeByRole).code(200);
                }
                else {
                    return h.response({ message: 'Unauthorized user' }).code(403);
                }
            }
            catch (error) {
                console.error('Error in getEmployeeByRole:', error);
                return h.response({ message: 'Failed to fetch employees by role' }).code(500);
            }
        });
    }
    getAllManagers(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allManagers = yield this.employeeService.getAllManagers();
                return h.response(allManagers).code(200);
            }
            catch (e) {
                return h.response({ message: e }).code(400);
            }
        });
    }
    getAllHrManagers(h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allHrManagers = yield this.employeeService.getAllHrManagers();
                return h.response(allHrManagers).code(200);
            }
            catch (e) {
                return h.response({ message: e }).code(400);
            }
        });
    }
    static uploadHandler(request, h) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = request.payload;
                if (!data || !data.file) {
                    return h.response({ error: 'No file provided' }).code(400);
                }
                const file = data.file;
                const buffer = yield EmployeeController.streamToBuffer(file);
                const employees = yield (0, excelWorker_1.parseExcel)(buffer);
                if (employees.length === 0) {
                    return h.response({ message: 'No valid employee data found in the file' }).code(400);
                }
                yield (0, excelWorker_1.pushEmployeesToQueue)(employees);
                return h.response({ message: `Successfully queued ${employees.length} employees for creation.` }).code(200);
            }
            catch (error) {
                console.error('Bulk upload error:', error);
                return h.response({ error: error.message || 'Failed to process upload' }).code(500);
            }
        });
    }
    static streamToBuffer(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const chunks = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });
        });
    }
    getGender() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.employeeService.getGender();
        });
    }
}
exports.EmployeeController = EmployeeController;
