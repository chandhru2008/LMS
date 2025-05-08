import { LeaveTypeService } from './leave-type-service';

export class LeaveTypeController {
    private leaveTypeService: LeaveTypeService
    constructor(leaveTypeService: LeaveTypeService) {
        this.leaveTypeService = leaveTypeService
    }

    async getAllLeaveTypes() {

        console.log("Hey")
        try {
            const leaveTypes = await this.leaveTypeService.getAllLeaveTypes();
            return leaveTypes
        } catch (error) {
            console.error('Controller error:', error);
            return ({ message: 'Failed to fetch leave types' });
        }
    }
}
