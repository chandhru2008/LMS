// routes/default-leave-entitlement-routes.ts
import { Server } from '@hapi/hapi';
import { DefaultLeaveEntitlementController } from './default-leave-entitlement-controller';
import { request } from 'http';


export function registerRoutes(server: Server, defaultLeaveEntitlementController: DefaultLeaveEntitlementController) {
  server.route([
    {
      method: 'GET',
      path: '/default-leaves',
      handler: async (request, h) => {
        return defaultLeaveEntitlementController.getAll(request, h);
      }
    },
    {
      method: 'GET',
      path: '/default-leaves/{role}',
      handler: async (request, h) => {
        return defaultLeaveEntitlementController.getByRole(request, h);
      }
    },
  ]);
}

