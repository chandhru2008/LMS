// src/helpers/notificationHelper.ts
import { LeaveApproval } from '../../modules/leave-approval/leave-approval-entity';
import { Employee } from '../../modules/empolyee/employee-entity';
import { LeaveRequest } from '../../modules/leave-requests/leave-request-entity';
import { sendEmail } from './email-helper';
import { DataSource } from 'typeorm';

export async function notifyNextApproverIfAny(
    dataSource: DataSource,
    currentRole: string,
    leaveRequestId: string,
    leaveRequest: LeaveRequest
) {
    const approvalRepo = dataSource.getRepository(LeaveApproval);
    const employeeRepo = dataSource.getRepository(Employee);

    let nextRole: "employee" | "hr" | "manager" | "director" | "hr_manager" | null = null;

    if (currentRole === 'manager') {
        const exists = await approvalRepo.exists({
            where: { leaveRequest: { id: leaveRequestId }, approverRole: 'hr' },
        });
        if (exists) nextRole = 'hr';
    } else if (currentRole === 'hr_manager') {
        const exists = await approvalRepo.exists({
            where: { leaveRequest: { id: leaveRequestId }, approverRole: 'director' },
        });
        if (exists) nextRole = 'director';
    }

    if (!nextRole) return;

    const nextApprovers = await employeeRepo.find({ where: { role: nextRole } });

    const leaveInfo = `${leaveRequest.employee.name} applied for ${leaveRequest.leaveType.name} from ${leaveRequest.start_date} to ${leaveRequest.end_date}`;
    const description = leaveRequest.description;
    const html = `<p>Click the button below to open the app:</p>
    <a href="https://lms-zwod.onrender.com" style="padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Go to App</a>`;

    for (const approver of nextApprovers) {
        await sendEmail(approver.email, leaveInfo, description, html);
    }
}
