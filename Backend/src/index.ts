require('dotenv').config({ path: '../.env' });
import * as Hapi from '@hapi/hapi';
import { Server } from '@hapi/hapi';
import { dataSource } from './config/db/conn';
import "reflect-metadata";

// Employee module classes
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



async function init() {
    try {
        console.log('Initializing database...');
        await dataSource.initialize();
        console.log(' Database initialized.');

        const server: Server = Hapi.server({
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

        const leaveTypeRepository = new LeaveTypeRepository();
        const leaveTypeService = new LeaveTypeService(leaveTypeRepository);
        const leaveTypeController = new LeaveTypeController(leaveTypeService);
        const leaveTypeRoutes = new LeaveTypeRoutes(leaveTypeController);


        const leaveRequestRepository = new LeaveRequestRepository();
        const leaveRequestService = new LeaveRequestService(leaveRequestRepository);
        const leaveRequestController = new LeaveRequestController(leaveRequestService);
        const leaveRequestRoutes = new LeaveRequestRoutes(leaveRequestController);


       
        const leaveBalanceRepository = new LeaveBalanceRepository();
        const leaveBalanceService = new LeaveBalanceService(leaveBalanceRepository, leaveTypeRepository)
        const leaveBalanceController = new LeaveBalanceController(leaveBalanceService);
        const leaveBalanceRoutes = new LeaveBalanceRoute(leaveBalanceController)


        const employeeRepository = new EmployeeRepository();
        const employeeService = new EmployeeService(employeeRepository);
        const employeeController = new EmployeeController(employeeService, leaveBalanceController);
        const employeeRoutes = new EmployeeRoutes(employeeController);


        leaveRequestRoutes.leaveRequestRoutes(server)
        leaveTypeRoutes.leaveTypeRoutes(server);
        employeeRoutes.employeeRoute(server);
        leaveBalanceRoutes.leaveBalanceRoute(server);
        console.log('✅ Employee routes registered.');

        await server.start();

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
    } catch (error) {
        console.error('Initialization error:', error);
        process.exit(1);
    }
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
