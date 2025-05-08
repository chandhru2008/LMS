import { Request, ResponseToolkit } from "@hapi/hapi";
import { EmployeeService } from "./employee-service";
import { generateJWTToken } from "../../utils/jwtUtil";
import { LeaveBalanceController } from "../leave-balances/leave-balance-controller";

export class EmployeeController {
    private employeeService: EmployeeService;
    private leaveBalanceController : LeaveBalanceController

    constructor(employeeService: EmployeeService, leaveBalanceController : LeaveBalanceController) {
        this.employeeService = employeeService;
        this.leaveBalanceController = leaveBalanceController;
    }

    async registerEmployee(request: Request, h: ResponseToolkit) {
        console.log("commccing");
        try {   
            const employeeData = request.payload as any;
            const newEmployee = await this.employeeService.registerEmployee(employeeData);
            const JWTToken = generateJWTToken(newEmployee);
            this.leaveBalanceController.assignDefaultLeaveBalances(newEmployee);
            return h.response({ JWTToken: JWTToken }).code(201);
            
        }catch(e){
            console.log(e)
            return h.response({message : e}).code(400);
        }

    }

    async loginEmployee(request : Request, h : ResponseToolkit){
        try{

            const loginEmployeeData = request.payload as any;
            console.log(loginEmployeeData);
            const employee = await this.employeeService.loginEmployee(loginEmployeeData);
            const JWTToken = generateJWTToken(employee);
            console.log(JWTToken);

            return h.response({JWTToken : JWTToken}).code(201);
        }catch(e){
            return h.response({message : e}).code(400);
        }
        
    }
}