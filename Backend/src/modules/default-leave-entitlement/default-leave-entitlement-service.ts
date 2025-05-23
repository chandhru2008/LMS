import { DefaultLeaveEntitlementRepository } from "./default-leave-entitlement-repository";

export class DefaultLeaveEntitlementService {
  constructor(private repo: DefaultLeaveEntitlementRepository) {}

  async getEntitlementsByRole(role: string) {
    return await this.repo.findByRole(role);
  }

  async getAllEntitlements() {
    return await this.repo.findAll();
  }
}
