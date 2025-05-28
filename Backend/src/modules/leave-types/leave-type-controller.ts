import { ResponseToolkit, Request } from '@hapi/hapi';
import { LeaveTypeService } from './leave-type-service';

export class LeaveTypeController {
    private leaveTypeService: LeaveTypeService
    constructor(leaveTypeService: LeaveTypeService) {
        this.leaveTypeService = leaveTypeService
    }

    async getAllLeaveTypes(request: Request, h: ResponseToolkit) {

        try {
            const leaveTypes = await this.leaveTypeService.getAllLeaveTypes();
            return h.response(leaveTypes).code(200);
        } catch (error) {
            console.error('Controller error:', error);
            return h.response({ message: 'Failed to fetch leave types' }).code(400);
        }
    }

    async getLeaveTypesByEligibility(request: Request, h: ResponseToolkit) {
        try {
            const gender = request.auth.credentials.payload.gender;
            const maritalStatus = request.auth.credentials.payload.materialStatus;
            request.auth.credentials.payload
            const leaveTypesByEligibility = await this.leaveTypeService.getLeaveTypeByEligibility(gender, maritalStatus)
            return h.response(leaveTypesByEligibility).code(200);
        } catch (error) {
            console.error('Controller error:', error);
            return h.response({ message: 'Failed to fetch leave types' }).code(400);
        }
    }
}
