// config/server.ts
import * as Hapi from '@hapi/hapi';
import { initializeDependencies } from './di-container';

import { default as dotenv } from 'dotenv';
import path from 'path';

import { employeeRoute } from '../modules/empolyee/employee-routes';
import { leaveTypeRoutes } from '../modules/leave-types/leave-type-routes';
import { leaveRequestRoutes } from '../modules/leave-requests/leave-request-routes';
import { leaveBalanceRoute } from '../modules/leave-balances/leave-balance-router';
import { leaveApproveRoutes } from '../modules/leave-approval/leave-approval-routes';
import { defaultLeaveEntitlementRoutes } from '../modules/default-leave-entitlement/default-leave-entitlement-routes';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export async function createServer(): Promise<Hapi.Server> {
  const server: Hapi.Server = Hapi.server({
    port: 3001,
    host: '0.0.0.0',
    routes: {
      state: { parse: true },
      cors: {
        origin: ['https://leave-management-app-2025.netlify.app'],
        credentials: true,
      },
    },
  });

  // Cookie config
  server.state('userSession', {
    ttl: 24 * 60 * 60 * 1000,
    isSecure: true,
    isSameSite : 'None',
    domain : 'lms-zwod.onrender.com',
    isHttpOnly: true,
    path: '/',
    encoding: 'base64json',
    clearInvalid: true,
    strictHeader: true,
  });

  // Register routes
  const {
    defaultLeaveEntitlementController,
    leaveTypeController,
    leaveRequestController,
    leaveBalanceController,
    employeeController,
    leaveApprovalController,
  } = initializeDependencies();

  defaultLeaveEntitlementRoutes(server, defaultLeaveEntitlementController);
  leaveTypeRoutes(server, leaveTypeController);
  leaveRequestRoutes(server, leaveRequestController);
  leaveBalanceRoute(server, leaveBalanceController);
  employeeRoute(server, employeeController);
  leaveApproveRoutes(server, leaveApprovalController);

  return server;
}
