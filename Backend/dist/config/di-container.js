"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDependencies = initializeDependencies;
// config/di-container.ts
const leave_type_service_1 = require("../modules/leave-types/leave-type-service");
const leave_type_controller_1 = require("../modules/leave-types/leave-type-controller");
const leave_request_service_1 = require("../modules/leave-requests/leave-request-service");
const leave_request_controller_1 = require("../modules/leave-requests/leave-request-controller");
const default_leave_entitlement_service_1 = require("../modules/default-leave-entitlement/default-leave-entitlement-service");
const default_leave_entitlement_controller_1 = require("../modules/default-leave-entitlement/default-leave-entitlement-controller");
const leave_balance_service_1 = require("../modules/leave-balances/leave-balance-service");
const leave_balance_controller_1 = require("../modules/leave-balances/leave-balance-controller");
const employee_service_1 = require("../modules/empolyee/employee-service");
const employee_controller_1 = require("../modules/empolyee/employee-controller");
const leave_approval_service_1 = require("../modules/leave-approval/leave-approval-service");
const leave_approval_controller_1 = require("../modules/leave-approval/leave-approval-controller");
const conn_1 = require("./db/conn");
function initializeDependencies() {
    const defaultLeaveEntitlementService = new default_leave_entitlement_service_1.DefaultLeaveEntitlementService();
    const defaultLeaveEntitlementController = new default_leave_entitlement_controller_1.DefaultLeaveEntitlementController(defaultLeaveEntitlementService);
    const leaveTypeService = new leave_type_service_1.LeaveTypeService();
    const leaveTypeController = new leave_type_controller_1.LeaveTypeController(leaveTypeService);
    const leaveRequestService = new leave_request_service_1.LeaveRequestService();
    const leaveRequestController = new leave_request_controller_1.LeaveRequestController(leaveRequestService);
    const leaveBalanceService = new leave_balance_service_1.LeaveBalanceService(defaultLeaveEntitlementService);
    const leaveBalanceController = new leave_balance_controller_1.LeaveBalanceController(leaveBalanceService);
    const employeeService = new employee_service_1.EmployeeService();
    const employeeController = new employee_controller_1.EmployeeController(employeeService, leaveBalanceController);
    const leaveApprovalService = new leave_approval_service_1.LeaveApprovalService(conn_1.dataSource);
    const leaveApprovalController = new leave_approval_controller_1.LeaveApprovalController(leaveApprovalService);
    return {
        defaultLeaveEntitlementController,
        leaveTypeController,
        leaveRequestController,
        leaveBalanceController,
        employeeController,
        leaveApprovalController,
    };
}
