"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLeaveEntitlementService = void 0;
const conn_1 = require("../../config/db/conn");
const default_leave_entitlement_entity_1 = require("./default-leave-entitlement-entity");
const defaultLeaveEntitlementRepo = conn_1.dataSource.getRepository(default_leave_entitlement_entity_1.DefaultLeaveEntitlement);
class DefaultLeaveEntitlementService {
    getEntitlementsByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield defaultLeaveEntitlementRepo.find({
                    where: { role },
                    relations: ['leaveType'],
                });
            }
            catch (error) {
                throw new Error('Error retrieving default leave entitlements');
            }
        });
    }
}
exports.DefaultLeaveEntitlementService = DefaultLeaveEntitlementService;
