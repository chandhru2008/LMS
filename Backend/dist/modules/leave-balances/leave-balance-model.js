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
exports.LeaveBalance = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("../empolyee/employee-entity");
const leave_type_model_1 = require("../leave-types/leave-type-model");
let LeaveBalance = class LeaveBalance {
};
exports.LeaveBalance = LeaveBalance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], LeaveBalance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.leaveBalances),
    (0, typeorm_1.JoinColumn)({ name: "employee_id" }),
    __metadata("design:type", employee_entity_1.Employee)
], LeaveBalance.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => leave_type_model_1.LeaveType, leaveType => leaveType.leaveBalances),
    (0, typeorm_1.JoinColumn)({ name: "leave_type_id" }),
    __metadata("design:type", leave_type_model_1.LeaveType)
], LeaveBalance.prototype, "leaveType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "used_leaves", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "remaining_leaves", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "total", void 0);
exports.LeaveBalance = LeaveBalance = __decorate([
    (0, typeorm_1.Entity)()
], LeaveBalance);
