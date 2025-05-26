"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveType = void 0;
const typeorm_1 = require("typeorm");
const leave_request_model_1 = require("../leave-requests/leave-request-model");
const leave_balance_model_1 = require("../leave-balances/leave-balance-model");
const default_leave_entitlement_entity_1 = require("../default-leave-entitlement/default-leave-entitlement-entity");
let LeaveType = class LeaveType {
};
exports.LeaveType = LeaveType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LeaveType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LeaveType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leave_request_model_1.LeaveRequest, leaveRequest => leaveRequest.leaveType),
    __metadata("design:type", Array)
], LeaveType.prototype, "leaveRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leave_balance_model_1.LeaveBalance, leaveBalance => leaveBalance.leaveType),
    __metadata("design:type", Array)
], LeaveType.prototype, "leaveBalances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => default_leave_entitlement_entity_1.DefaultLeaveEntitlement, (entitlement) => entitlement.leaveType),
    __metadata("design:type", Object)
], LeaveType.prototype, "defaultEntitlements", void 0);
exports.LeaveType = LeaveType = __decorate([
    (0, typeorm_1.Entity)()
], LeaveType);
