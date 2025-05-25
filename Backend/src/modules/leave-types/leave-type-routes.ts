import { Server } from '@hapi/hapi'; 
import { LeaveTypeController } from "./leave-type-controller";
import { Request, ResponseToolkit } from '@hapi/hapi';



    export function leaveTypeRoutes(server : Server, leaveTypeController : LeaveTypeController){

        server.route([
            {
                method : 'GET',
                path : "/leave-types",
                handler : async (request : Request, response : ResponseToolkit) => await leaveTypeController.getAllLeaveTypes(request , response)

            }
        ])

    }
