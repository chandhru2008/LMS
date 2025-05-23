import { Request, ResponseToolkit } from '@hapi/hapi';
import { DefaultLeaveEntitlementService } from './default-leave-entitlement-service';

export class DefaultLeaveEntitlementController {
  constructor(private service: DefaultLeaveEntitlementService) {}

  async getByRole(request: Request, h: ResponseToolkit) {
    try {
      const { role } = request.params;
      const data = await this.service.getEntitlementsByRole(role.toLowerCase());
      return h.response(data).code(200);
    } catch (err: any) {
      return h.response({ message: err.message }).code(500);
    }
  }

  async getAll(request: Request, h: ResponseToolkit) {
    try {
      const data = await this.service.getAllEntitlements();
      return h.response(data).code(200);
    } catch (err: any) {
      return h.response({ message: err.message }).code(500);
    }
  }
}
