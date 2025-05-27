// config/di-container.ts
import { LeaveTypeService } from '../modules/leave-types/leave-type-service';
import { LeaveTypeController } from '../modules/leave-types/leave-type-controller';

import { LeaveRequestService } from '../modules/leave-requests/leave-request-service';
import { LeaveRequestController } from '../modules/leave-requests/leave-request-controller';

import { DefaultLeaveEntitlementService } from '../modules/default-leave-entitlement/default-leave-entitlement-service';
import { DefaultLeaveEntitlementController } from '../modules/default-leave-entitlement/default-leave-entitlement-controller';

import { LeaveBalanceService } from '../modules/leave-balances/leave-balance-service';
import { LeaveBalanceController } from '../modules/leave-balances/leave-balance-controller';

import { EmployeeService } from '../modules/empolyee/employee-service';
import { EmployeeController } from '../modules/empolyee/employee-controller';

import { LeaveApprovalService } from '../modules/leave-approval/leave-approval-service';
import { LeaveApprovalController } from '../modules/leave-approval/leave-approval-controller';

import { dataSource } from './db/conn';

export function initializeDependencies() {
  const defaultLeaveEntitlementService = new DefaultLeaveEntitlementService();
  const defaultLeaveEntitlementController = new DefaultLeaveEntitlementController(defaultLeaveEntitlementService);

  const leaveTypeService = new LeaveTypeService();
  const leaveTypeController = new LeaveTypeController(leaveTypeService);

  const leaveRequestService = new LeaveRequestService();
  const leaveRequestController = new LeaveRequestController(leaveRequestService);

  const leaveBalanceService = new LeaveBalanceService(defaultLeaveEntitlementService);
  const leaveBalanceController = new LeaveBalanceController(leaveBalanceService);

  const employeeService = new EmployeeService(leaveBalanceService);
  const employeeController = new EmployeeController(employeeService);

  const leaveApprovalService = new LeaveApprovalService(dataSource);
  const leaveApprovalController = new LeaveApprovalController(leaveApprovalService);

  return {
    defaultLeaveEntitlementController,
    leaveTypeController,
    leaveRequestController,
    leaveBalanceController,
    employeeController,
    leaveApprovalController,
  };
}
