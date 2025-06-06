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
exports.notifyNextApproverIfAny = notifyNextApproverIfAny;
// src/helpers/notificationHelper.ts
const leave_approval_entity_1 = require("../../modules/leave-approval/leave-approval-entity");
const employee_entity_1 = require("../../modules/empolyee/employee-entity");
const email_helper_1 = require("./email-helper");
function notifyNextApproverIfAny(dataSource, currentRole, leaveRequestId, leaveRequest) {
    return __awaiter(this, void 0, void 0, function* () {
        const approvalRepo = dataSource.getRepository(leave_approval_entity_1.LeaveApproval);
        const employeeRepo = dataSource.getRepository(employee_entity_1.Employee);
        let nextRole = null;
        if (currentRole === 'manager') {
            const exists = yield approvalRepo.exists({
                where: { leaveRequest: { id: leaveRequestId }, approverRole: 'hr' },
            });
            if (exists)
                nextRole = 'hr';
        }
        else if (currentRole === 'hr_manager') {
            const exists = yield approvalRepo.exists({
                where: { leaveRequest: { id: leaveRequestId }, approverRole: 'director' },
            });
            if (exists)
                nextRole = 'director';
        }
        if (!nextRole)
            return;
        const nextApprovers = yield employeeRepo.find({ where: { role: nextRole } });
        const leaveInfo = `${leaveRequest.employee.name} applied for ${leaveRequest.leaveType.name} from ${leaveRequest.start_date} to ${leaveRequest.end_date}`;
        const description = leaveRequest.description;
        const html = `<p>Click the button below to open the app:</p>
    <a href="https://lms-zwod.onrender.com" style="padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Go to App</a>`;
        for (const approver of nextApprovers) {
            yield (0, email_helper_1.sendEmail)(approver.email, leaveInfo, description, html);
        }
    });
}
