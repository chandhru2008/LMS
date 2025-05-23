// routes/default-leave-entitlement-routes.ts
import { Server } from '@hapi/hapi';
import { DefaultLeaveEntitlementController } from './default-leave-entitlement-controller';

export class DefaultLeaveEntitlementRoutes {
  constructor(private controller: DefaultLeaveEntitlementController) {}

  public registerRoutes(server: Server) {
    server.route([
      {
        method: 'GET',
        path: '/default-leaves',
        handler: this.controller.getAll.bind(this.controller),
      },
      {
        method: 'GET',
        path: '/default-leaves/{role}',
        handler: this.controller.getByRole.bind(this.controller),
      },
    ]);
  }
}
