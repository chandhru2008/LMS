import { Request, ResponseToolkit, Server, ServerApplicationState } from '@hapi/hapi';
import { DefaultLeaveEntitlementService } from './default-leave-entitlement-service';


export class DefaultLeaveEntitlementController {
  registerRoutes(server: Server<ServerApplicationState>) {
      throw new Error('Method not implemented.');
  }

  private defaultLeaveEntitlementService: DefaultLeaveEntitlementService

  constructor(defaultLeaveEntitlementService: DefaultLeaveEntitlementService) {
    this.defaultLeaveEntitlementService = defaultLeaveEntitlementService
  }

  async getByRole(request: Request, h: ResponseToolkit) {
    try {
      const { role } = request.params;
      const data = await this.defaultLeaveEntitlementService.getEntitlementsByRole(role.toLowerCase());
      return h.response(data).code(200);
    } catch (err: any) {
      return h.response({ message: err.message }).code(500);
    }
  }

  async getAll(request: Request, h: ResponseToolkit) {
    try {
      const data = await this.defaultLeaveEntitlementService.getAllEntitlements();
      return h.response(data).code(200);
    } catch (err: any) {
      return h.response({ message: err.message }).code(500);
    }
  }
}
