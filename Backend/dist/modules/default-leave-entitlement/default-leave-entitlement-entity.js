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
exports.DefaultLeaveEntitlement = void 0;
const typeorm_1 = require("typeorm");
const leave_type_model_1 = require("../leave-types/leave-type-model");
let DefaultLeaveEntitlement = class DefaultLeaveEntitlement {
};
exports.DefaultLeaveEntitlement = DefaultLeaveEntitlement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DefaultLeaveEntitlement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DefaultLeaveEntitlement.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => leave_type_model_1.LeaveType, (leaveType) => leaveType.defaultEntitlements),
    (0, typeorm_1.JoinColumn)({ name: 'leave_type_id' }),
    __metadata("design:type", leave_type_model_1.LeaveType)
], DefaultLeaveEntitlement.prototype, "leaveType", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], DefaultLeaveEntitlement.prototype, "defaultDays", void 0);
exports.DefaultLeaveEntitlement = DefaultLeaveEntitlement = __decorate([
    (0, typeorm_1.Entity)('default_leave_entitlements')
], DefaultLeaveEntitlement);
