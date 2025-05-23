// index.ts
import 'reflect-metadata'; // Required by TypeORM
import * as Hapi from '@hapi/hapi';
import * as dotenv from 'dotenv';
import { Server } from '@hapi/hapi';
import { dataSource } from './config/db/conn';

// Import your modules (update paths if needed)
import { EmployeeController } from './modules/empolyee/employee-controller';
import { EmployeeService } from './modules/empolyee/employee-service';
import { EmployeeRepository } from './modules/empolyee/employee-repository';
import { EmployeeRoutes } from './modules/empolyee/employee-routes';

import { LeaveTypeRepository } from './modules/leave-types/leave-type-repository';
import { LeaveTypeService } from './modules/leave-types/leave-type-service';
import { LeaveTypeController } from './modules/leave-types/leave-type-controller';
import { LeaveTypeRoutes } from './modules/leave-types/leave-type-routes';

import { LeaveRequestController } from './modules/leave-requests/leave-request-controller';
import { LeaveRequestRepository } from './modules/leave-requests/leave-request-repository.';
import { LeaveRequestRoutes } from './modules/leave-requests/leave-request-routes';
import { LeaveRequestService } from './modules/leave-requests/leave-request-service';

import { LeaveBalanceController } from './modules/leave-balances/leave-balance-controller';
import { LeaveBalanceService } from './modules/leave-balances/leave-balance-service';
import { LeaveBalanceRepository } from './modules/leave-balances/leave-balance-repository';
import { LeaveBalanceRoute } from './modules/leave-balances/leave-balance-router';
import path from 'path';
import { LeaveApprovalRoutes } from './modules/leave-approval/leave-approval-routes';
import { LeaveApprovalService } from './modules/leave-approval/leave-approval-service';
import { LeaveApprovalController } from './modules/leave-approval/leave-approval-controller';
import { DefaultLeaveEntitlementRepository } from './modules/default-leave-entitlement/default-leave-entitlement-repository';
import { DefaultLeaveEntitlementService } from './modules/default-leave-entitlement/default-leave-entitlement-service';
import { DefaultLeaveEntitlementController } from './modules/default-leave-entitlement/default-leave-entitlement-controller';
import { DefaultLeaveEntitlementRoutes } from './modules/default-leave-entitlement/default-leave-entitlement-routes';

// Load .env config
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function init() {
  try {


    console.log('Initializing database...');
    await dataSource.initialize();
    console.log('✅ Database initialized.');

    const server: Server = Hapi.server({
      port: 3002,
      host: 'localhost',
      routes: {
        state: {
          parse: true,
        },
        cors: {
          origin: ['http://localhost:5173'],
          credentials: true // Allow cookies
        }
      },
    });

    console.log('Setting up dependencies and routes...')

    const defaultLeaveEntitlementRepository = new DefaultLeaveEntitlementRepository();
    const defaultLeaveEntitlementService = new DefaultLeaveEntitlementService(defaultLeaveEntitlementRepository);
    const defaultLeaveEntitlementController = new DefaultLeaveEntitlementController(defaultLeaveEntitlementService);
    const defaultLeaveEntitlementRoutes = new DefaultLeaveEntitlementRoutes(defaultLeaveEntitlementController);

    defaultLeaveEntitlementRoutes.registerRoutes(server); // this is what you want

    // Setup LeaveType module
    const leaveTypeRepository = new LeaveTypeRepository();
    const leaveTypeService = new LeaveTypeService(leaveTypeRepository);
    const leaveTypeController = new LeaveTypeController(leaveTypeService);
    const leaveTypeRoutes = new LeaveTypeRoutes(leaveTypeController);
    leaveTypeRoutes.leaveTypeRoutes(server);
    

    // Setup LeaveRequest module
    const leaveRequestRepository = new LeaveRequestRepository();
    const leaveRequestService = new LeaveRequestService(leaveRequestRepository);
    const leaveRequestController = new LeaveRequestController(leaveRequestService);
    const leaveRequestRoutes = new LeaveRequestRoutes(leaveRequestController);
    leaveRequestRoutes.leaveRequestRoutes(server);
  

    // Setup LeaveBalance module
    const leaveBalanceRepository = new LeaveBalanceRepository();
    const leaveBalanceService = new LeaveBalanceService(leaveBalanceRepository, defaultLeaveEntitlementRepository);
    const leaveBalanceController = new LeaveBalanceController(leaveBalanceService);
    const leaveBalanceRoutes = new LeaveBalanceRoute(leaveBalanceController);
    leaveBalanceRoutes.leaveBalanceRoute(server);
   

    // Setup Employee module
    const employeeRepository = new EmployeeRepository();
    const employeeService = new EmployeeService(employeeRepository);
    const employeeController = new EmployeeController(employeeService, leaveBalanceController);
    const employeeRoutes = new EmployeeRoutes(employeeController);
    employeeRoutes.employeeRoute(server);
  

    const leaveApprovalService = new LeaveApprovalService(dataSource);
    const leaveApprovalController = new LeaveApprovalController(leaveApprovalService);
    const leaveApprovalRoutes = new LeaveApprovalRoutes(leaveApprovalController);

    leaveApprovalRoutes.register(server);

    // Cookie config for userSession
    server.state('userSession', {
      ttl: 24 * 60 * 60 * 1000,
      isSecure: false,
      // isSameSite: 'None',
      isHttpOnly: true,
      // domain: 'lms-zwod.onrender.com',
      path: '/',
      encoding: 'base64json',
      clearInvalid: true,
      strictHeader: true,
    });

    await server.start();
    console.log('server is running on', server.info.uri);

  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
}

// Global error handlers
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Initialize app
init();
