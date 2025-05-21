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

import { LeaveTypeRepository } from './modules/leave-types/leave-repository';
import { LeaveTypeService } from './modules/leave-types/leave-type-service';
import { LeaveTypeController } from './modules/leave-types/leave-type-controller';
import { LeaveTypeRoutes } from './modules/leave-types/leave-routes';

import { LeaveRequestController } from './modules/leave-requests/leave-request-controller';
import { LeaveRequestRepository } from './modules/leave-requests/leave-request-repository.';
import { LeaveRequestRoutes } from './modules/leave-requests/leave-request-routes';
import { LeaveRequestService } from './modules/leave-requests/leave-request-service';

import { LeaveBalanceController } from './modules/leave-balances/leave-balance-controller';
import { LeaveBalanceService } from './modules/leave-balances/leave-balance-service';
import { LeaveBalanceRepository } from './modules/leave-balances/leave-balance-repository';
import { LeaveBalanceRoute } from './modules/leave-balances/leave-balance-router';
import path from 'path';

// Load .env config
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function init() {
  try {

    console.log('DB_USERNAME:', process.env.DB_USERNAME);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log("port :", process.env.DB_PORT)


    console.log('Initializing database...');
    await dataSource.initialize();
    console.log('✅ Database initialized.');

    const server: Server = Hapi.server({
      port: 3002,
      host: 'localhost',
      routes: {
        state: {
          parse: true,
          failAction: async (request, h, err) => {
            console.warn('Invalid cookie received:', err?.message);
            return h.continue;
          }
        },
        cors: {
          origin: ['http://localhost:5173'],
          credentials: true // Allow cookies
        }
      },
    });

    console.log('Setting up dependencies and routes...')

    // Setup LeaveType module
    const leaveTypeRepository = new LeaveTypeRepository();
    const leaveTypeService = new LeaveTypeService(leaveTypeRepository);
    const leaveTypeController = new LeaveTypeController(leaveTypeService);
    const leaveTypeRoutes = new LeaveTypeRoutes(leaveTypeController);
    leaveTypeRoutes.leaveTypeRoutes(server);
    console.log('✅ LeaveType routes registered.');

    // Setup LeaveRequest module
    const leaveRequestRepository = new LeaveRequestRepository();
    const leaveRequestService = new LeaveRequestService(leaveRequestRepository);
    const leaveRequestController = new LeaveRequestController(leaveRequestService);
    const leaveRequestRoutes = new LeaveRequestRoutes(leaveRequestController);
    leaveRequestRoutes.leaveRequestRoutes(server);
    console.log('✅ LeaveRequest routes registered.');

    // Setup LeaveBalance module
    const leaveBalanceRepository = new LeaveBalanceRepository();
    const leaveBalanceService = new LeaveBalanceService(leaveBalanceRepository, leaveTypeRepository);
    const leaveBalanceController = new LeaveBalanceController(leaveBalanceService);
    const leaveBalanceRoutes = new LeaveBalanceRoute(leaveBalanceController);
    leaveBalanceRoutes.leaveBalanceRoute(server);
    console.log('✅ LeaveBalance routes registered.');

    // Setup Employee module
    const employeeRepository = new EmployeeRepository();
    const employeeService = new EmployeeService(employeeRepository);
    const employeeController = new EmployeeController(employeeService, leaveBalanceController);
    const employeeRoutes = new EmployeeRoutes(employeeController);
    employeeRoutes.employeeRoute(server);
    console.log('✅ Employee routes registered.');

    // Cookie config for userSession
    server.state('userSession', {
      ttl: 24 * 60 * 60 * 1000,
      isSecure: false,
      isHttpOnly: true,
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
