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
require('dotenv').config({ path: '../.env' });
const Hapi = __importStar(require("@hapi/hapi"));
const conn_1 = require("./config/db/conn");
require("reflect-metadata");
// Employee module classes
const employee_controller_1 = require("./modules/empolyee/employee-controller");
const employee_service_1 = require("./modules/empolyee/employee-service");
const employee_repository_1 = require("./modules/empolyee/employee-repository");
const employee_routes_1 = require("./modules/empolyee/employee-routes");
const leave_repository_1 = require("./modules/leave-types/leave-repository");
const leave_type_service_1 = require("./modules/leave-types/leave-type-service");
const leave_type_controller_1 = require("./modules/leave-types/leave-type-controller");
const leave_routes_1 = require("./modules/leave-types/leave-routes");
const leave_request_controller_1 = require("./modules/leave-requests/leave-request-controller");
const leave_request_repository_1 = require("./modules/leave-requests/leave-request-repository.");
const leave_request_routes_1 = require("./modules/leave-requests/leave-request-routes");
const leave_request_service_1 = require("./modules/leave-requests/leave-request-service");
const leave_balance_controller_1 = require("./modules/leave-balances/leave-balance-controller");
const leave_balance_service_1 = require("./modules/leave-balances/leave-balance-service");
const leave_balance_repository_1 = require("./modules/leave-balances/leave-balance-repository");
const leave_balance_router_1 = require("./modules/leave-balances/leave-balance-router");
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Initializing database...');
            yield conn_1.dataSource.initialize();
            console.log(' Database initialized.');
            const server = Hapi.server({
                port: 3001,
                host: 'localhost',
                routes: {
                    state: {
                        parse: true,
                        failAction: 'error',
                    },
                    cors: {
                        origin: ['http://localhost:5173'],
                        credentials: true,
                    },
                },
            });
            console.log('Setting up dependencies...');
            // Dependency injection for Employee module
            const leaveTypeRepository = new leave_repository_1.LeaveTypeRepository();
            const leaveTypeService = new leave_type_service_1.LeaveTypeService(leaveTypeRepository);
            const leaveTypeController = new leave_type_controller_1.LeaveTypeController(leaveTypeService);
            const leaveTypeRoutes = new leave_routes_1.LeaveTypeRoutes(leaveTypeController);
            const leaveRequestRepository = new leave_request_repository_1.LeaveRequestRepository();
            const leaveRequestService = new leave_request_service_1.LeaveRequestService(leaveRequestRepository);
            const leaveRequestController = new leave_request_controller_1.LeaveRequestController(leaveRequestService);
            const leaveRequestRoutes = new leave_request_routes_1.LeaveRequestRoutes(leaveRequestController);
            const leaveBalanceRepository = new leave_balance_repository_1.LeaveBalanceRepository();
            const leaveBalanceService = new leave_balance_service_1.LeaveBalanceService(leaveBalanceRepository, leaveTypeRepository);
            const leaveBalanceController = new leave_balance_controller_1.LeaveBalanceController(leaveBalanceService);
            const leaveBalanceRoutes = new leave_balance_router_1.LeaveBalanceRoute(leaveBalanceController);
            const employeeRepository = new employee_repository_1.EmployeeRepository();
            const employeeService = new employee_service_1.EmployeeService(employeeRepository);
            const employeeController = new employee_controller_1.EmployeeController(employeeService, leaveBalanceController);
            const employeeRoutes = new employee_routes_1.EmployeeRoutes(employeeController);
            leaveRequestRoutes.leaveRequestRoutes(server);
            leaveTypeRoutes.leaveTypeRoutes(server);
            employeeRoutes.employeeRoute(server);
            leaveBalanceRoutes.leaveBalanceRoute(server);
            console.log('✅ Employee routes registered.');
            yield server.start();
            server.state('userSession', {
                ttl: 24 * 60 * 60 * 1000,
                isSecure: false,
                isHttpOnly: true,
                path: '/',
                encoding: 'base64json',
                clearInvalid: true,
                strictHeader: true,
            });
            console.log(`Server running at: ${server.info.uri}`);
        }
        catch (error) {
            console.error('Initialization error:', error);
            process.exit(1);
        }
    });
}
// Global error handling
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
init();
