"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveTypeRoutes = void 0;
class LeaveTypeRoutes {
    constructor(leaveTypeController) {
        this.leaveTypeController = leaveTypeController;
    }
    leaveTypeRoutes(server) {
        server.route([
            {
                method: 'GET',
                path: "/leave-types",
                handler: this.leaveTypeController.getAllLeaveTypes.bind(this.leaveTypeController)
            }
        ]);
    }
}
exports.LeaveTypeRoutes = LeaveTypeRoutes;
