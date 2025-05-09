import { Request, ResponseToolkit } from "@hapi/hapi";
import { EmployeeService } from "./employee-service";
import { generateJWTToken } from "../../utils/jwtUtil";
import { LeaveBalanceController } from "../leave-balances/leave-balance-controller";

export class EmployeeController {
  private employeeService: EmployeeService;
  private leaveBalanceController: LeaveBalanceController;

  constructor(employeeService: EmployeeService, leaveBalanceController: LeaveBalanceController) {
    this.employeeService = employeeService;
    this.leaveBalanceController = leaveBalanceController;
  }

  async registerEmployee(request: Request, h: ResponseToolkit) {
    try {
      const employeeData = request.payload as any;
      const newEmployee = await this.employeeService.registerEmployee(employeeData);

      const JWTToken = generateJWTToken(newEmployee);


      await this.leaveBalanceController.assignDefaultLeaveBalances(newEmployee);

      // Setting cookie
      h.state('userSession', {
        role: newEmployee.role,
        token: JWTToken,
      });

      return h.response({
        message: 'Employee registered successfully',
        JWTToken,
      }).code(201);

    } catch (e) {
      console.error(e);
      return h.response({ message: 'Registration failed', error: e }).code(400);
    }
  }

  async loginEmployee(request: Request, h: ResponseToolkit) {
    try {
      const loginEmployeeData = request.payload as any;
      const employee = await this.employeeService.loginEmployee(loginEmployeeData);
      const JWTToken = generateJWTToken(employee);

      h.state('userSession', {
        role: employee.role,
        token: JWTToken,
      });

      return h.response({
        message: 'Login successful',
        JWTToken,
      }).code(200);
    } catch (e) {
      return h.response({ message: 'Login failed', error: e }).code(400);
    }
  }
}
