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
exports.Employee = void 0;
const typeorm_1 = require("typeorm");
const leave_request_entity_1 = require("../leave-requests/leave-request-entity");
const leave_balance_entity_1 = require("../leave-balances/leave-balance-entity");
let Employee = class Employee {
};
exports.Employee = Employee;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Employee.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Employee.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['male', 'female']
    }),
    __metadata("design:type", String)
], Employee.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["employee", "manager", "hr", "hr_manager", "director"],
        default: "employee",
    }),
    __metadata("design:type", String)
], Employee.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['single', 'married'], nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "maritalStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "intern_id" }),
    __metadata("design:type", Employee)
], Employee.prototype, "intern", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "manager_id" }),
    __metadata("design:type", Employee)
], Employee.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "hr_id" }),
    __metadata("design:type", Employee)
], Employee.prototype, "hr", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "hr_manager_id" }),
    __metadata("design:type", Employee)
], Employee.prototype, "hrManager", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "director_id" }),
    __metadata("design:type", Employee)
], Employee.prototype, "director", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Employee.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Employee.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leave_request_entity_1.LeaveRequest, (leaveRequest) => leaveRequest.employee),
    __metadata("design:type", Array)
], Employee.prototype, "leaveRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leave_balance_entity_1.LeaveBalance, (leaveBalance) => leaveBalance.employee),
    __metadata("design:type", Array)
], Employee.prototype, "leaveBalances", void 0);
exports.Employee = Employee = __decorate([
    (0, typeorm_1.Entity)()
], Employee);
