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
exports.LeaveRequest = void 0;
const typeorm_1 = require("typeorm");
const leave_type_model_1 = require("../leave-types/leave-type-model");
const employee_model_1 = require("../empolyee/employee-model");
let LeaveRequest = class LeaveRequest {
};
exports.LeaveRequest = LeaveRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], LeaveRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => leave_type_model_1.LeaveType, leaveType => leaveType.leaveRequests),
    (0, typeorm_1.JoinColumn)({ name: "leave_type_id" }),
    __metadata("design:type", leave_type_model_1.LeaveType)
], LeaveRequest.prototype, "leaveType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_model_1.Employee, employee => employee.leaveRequests),
    (0, typeorm_1.JoinColumn)({ name: "employee_id" }),
    __metadata("design:type", employee_model_1.Employee)
], LeaveRequest.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LeaveRequest.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["Pending", "Approved", "Rejected", "Cancelled"],
        default: "Pending",
    }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "manager_approval", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "HR_approval", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "director_approval", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "end_date", void 0);
exports.LeaveRequest = LeaveRequest = __decorate([
    (0, typeorm_1.Entity)()
], LeaveRequest);
