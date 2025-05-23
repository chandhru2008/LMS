import { Server } from '@hapi/hapi'; 
import { LeaveTypeController } from "./leave-type-controller";


export class LeaveTypeRoutes{
    private leaveTypeController : LeaveTypeController;
    constructor(leaveTypeController : LeaveTypeController){
        this.leaveTypeController = leaveTypeController;
    }
    public leaveTypeRoutes(server : Server){

        server.route([
            {
                method : 'GET',
                path : "/leave-types",
                handler : this.leaveTypeController.getAllLeaveTypes.bind(this.leaveTypeController)

            }
        ])

    }
}