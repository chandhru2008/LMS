// routes/default-leave-entitlement-routes.ts
import { Server } from '@hapi/hapi';
import { DefaultLeaveEntitlementController } from './default-leave-entitlement-controller';
import { request } from 'http';


export function defaultLeaveEntitlementRoutes(server: Server, defaultLeaveEntitlementController: DefaultLeaveEntitlementController) {
  server.route([
    {
      method: 'GET',
      path: '/default-leaves/by-role',
      handler: async (request, h) => {
        return defaultLeaveEntitlementController.getByRole(request, h);
      }
    }
  ]);
}

