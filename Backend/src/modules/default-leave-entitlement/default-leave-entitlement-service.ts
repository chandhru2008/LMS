import { Server, ServerApplicationState } from "@hapi/hapi";
import { dataSource } from "../../config/db/conn";
import { DefaultLeaveEntitlementController } from "./default-leave-entitlement-controller";
import { DefaultLeaveEntitlement } from "./default-leave-entitlement-entity";
import { Employee } from "../../types";
import { LeaveType } from "../leave-types/leave-type-model";


const defaultLeaveEntitlementRepo = dataSource.getRepository(DefaultLeaveEntitlement);


export class DefaultLeaveEntitlementService {


  async getEntitlementsByRole(role: string) {
    try {
      return await defaultLeaveEntitlementRepo.find({
        where: { role },
        relations: ['leaveType'],
      });
    } catch (error) {
      throw new Error('Error retrieving default leave entitlements');
    }
  }

}
