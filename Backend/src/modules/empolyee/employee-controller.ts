import { Request, ResponseToolkit } from "@hapi/hapi";
import { EmployeeService } from './employee-service'
import { generateJWTToken, verifyToken } from "../../utils/jwtUtil";
import { LeaveBalanceController } from "../leave-balances/leave-balance-controller";
import jwt from 'jsonwebtoken';

export class EmployeeController {

  private employeeService: EmployeeService;
  private leaveBalanceController: LeaveBalanceController;
  private jwtSecret: string;

  constructor(employeeService: EmployeeService, leaveBalanceController: LeaveBalanceController) {
    this.employeeService = employeeService;
    this.leaveBalanceController = leaveBalanceController;
    this.jwtSecret = process.env.JWT_SECRET || '';
  }

  public getTokenFromRequest(request: Request): string | null {
    return request.state.userSession?.token || null;
  }

  public verifyToken(token: string) {
    return jwt.verify(token, this.jwtSecret);
  }

  private handleError(h: ResponseToolkit, error: any, defaultMessage = 'Internal server error') {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return h.response({ message: 'Invalid or expired token' }).code(401);
    }
    console.error('Error in controller:', error);
    return h.response({ message: error.message || defaultMessage }).code(400);
  }

  async registerEmployee(request: Request, h: ResponseToolkit) {
    try {
      const token = this.getTokenFromRequest(request);
      if (!token) {
        return h.response({ message: 'JWT token must be provided' }).code(400);
      }

      const decoded = this.verifyToken(token) as any;
      const role = decoded.payload?.role?.toLowerCase();

      if (role === 'hr' || role === 'hr_manager') {
        const employeeData = request.payload as any;
        const newEmployee = await this.employeeService.registerEmployee(employeeData);

        await this.leaveBalanceController.assignDefaultLeaveBalances(newEmployee);

        return h.response({ message: 'Employee registered successfully' }).code(200);
      }

      return h.response({ message: 'Unauthorized user' }).code(401);
    } catch (error: any) {
      return this.handleError(h, error);
    }
  }

  async loginEmployee(request: Request, h: ResponseToolkit) {
    try {
      const { email, password } = request.payload as { email: string; password: string };
      const employee = await this.employeeService.loginEmployee({ email, password });
      const JWTToken = generateJWTToken(employee);
      h.state('userSession', { token: JWTToken });
      return h.response({ message: 'Login successful', JWTToken }).code(200);
    } catch (error: any) {
      if (error.message === "Invalid password" || error.message === 'Employee not found') {
        return h.response({ message: error.message }).code(400);
      }
      console.error('Login error:', error);
      return h.response({ message: "There is something wrong with backend" }).code(400);
    }
  }

  async authenticateEmployee(request: Request, h: ResponseToolkit) {
    try {
      const token = this.getTokenFromRequest(request);
      if (!token) {
        return h.response({ message: 'JWT token must be provided' }).code(400);
      }

      const verifiedEmployee = this.verifyToken(token) as any;

      return h.response({
        employeeName: verifiedEmployee.payload?.name,
        role: verifiedEmployee.payload?.role,
      }).code(200);
    } catch (error: any) {
      return this.handleError(h, error);
    }
  }

  async getAllEmployee(request: Request, h: ResponseToolkit) {

    const token = this.getTokenFromRequest(request);
    if (!token) {
      return h.response({ message: 'JWT token must be provided' }).code(400);
    }
    const verifiedEmployee = this.verifyToken(token) as any;
    if (verifiedEmployee.payload.role === 'HR' || verifiedEmployee.payload.role === 'director') {
      const allEmployee = await this.employeeService.getAllEmployee();
      return h.response(allEmployee).code(200);
    } else {
      return h.response({ message: 'Unauthorized user' }).code(400);
    }
  }

  async getEmployeeByRole(request: Request, h: ResponseToolkit) {
    const token = this.getTokenFromRequest(request);
    if (!token) {
      return h.response({ message: 'JWT token must be provided' }).code(400);
    }

    const verifiedEmployee = this.verifyToken(token) as any;

    console.log(verifiedEmployee)

    if (verifiedEmployee.payload.role === 'manager' || verifiedEmployee.payload.role === 'hr_manager') {
      const id = verifiedEmployee.payload.id
      const role = verifiedEmployee.payload.role
      console.log(id, role)
      const getemployeeByRole = await this.employeeService.getEmployeeByRole(id, role);
      return h.response(getemployeeByRole).code(200)
    }
    else {
      return h.response({ message: 'Unauthorized user' }).code(400);
    }
  }
}
