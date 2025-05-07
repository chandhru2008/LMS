import { Request,ResponseToolkit } from "@hapi/hapi";
import { EmployeeService } from "./employee-service";

export class EmployeeController{
    private employeeService : EmployeeService;

    constructor(employeeService : EmployeeService){
        this.employeeService = employeeService;
    }

    async registerEmployee(request : Request, h : ResponseToolkit){
        const employeeData = request.payload as any;
        const newEmployee = await this.employeeService.registerEmployee(employeeData);
        
    }
}