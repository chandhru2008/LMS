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
exports.LeaveApproval = void 0;
const typeorm_1 = require("typeorm");
const leave_request_entity_1 = require("../leave-requests/leave-request-entity");
const employee_entity_1 = require("../empolyee/employee-entity");
let LeaveApproval = class LeaveApproval {
};
exports.LeaveApproval = LeaveApproval;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LeaveApproval.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => leave_request_entity_1.LeaveRequest, (leaveRequest) => leaveRequest.approvals),
    (0, typeorm_1.JoinColumn)({ name: 'leave_request_id' }) // optional but good to specify
    ,
    __metadata("design:type", leave_request_entity_1.LeaveRequest)
], LeaveApproval.prototype, "leaveRequest", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LeaveApproval.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LeaveApproval.prototype, "approverRole", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, (employee) => employee.approvalsGiven, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }) // foreign key column
    ,
    __metadata("design:type", employee_entity_1.Employee)
], LeaveApproval.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Pending' }),
    __metadata("design:type", String)
], LeaveApproval.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LeaveApproval.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ nullable: true }),
    __metadata("design:type", Date)
], LeaveApproval.prototype, "approvedAt", void 0);
exports.LeaveApproval = LeaveApproval = __decorate([
    (0, typeorm_1.Entity)('leave_approvals')
], LeaveApproval);
