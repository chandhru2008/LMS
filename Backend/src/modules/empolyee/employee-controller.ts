import { Request, ResponseToolkit } from "@hapi/hapi";
import { EmployeeService } from './employee-service'
import { generateJWTToken } from '../../common/utils/jwt-util'
import { LoginEmployeePayload, RegisterEmployeePayload } from "../../types";


export class EmployeeController {

  private employeeService: EmployeeService;


  constructor(employeeService: EmployeeService) {
    this.employeeService = employeeService;

  }


  private handleError(h: ResponseToolkit, error, defaultMessage = 'Internal server error') {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return h.response({ message: 'Invalid or expired token' }).code(401);
    }
    console.error('Error in controller:', error);
    return h.response({ message: error.message || defaultMessage }).code(400);
  }


  async registerEmployee(request: Request, h: ResponseToolkit) {
    try {

      const employeeData = request.payload as RegisterEmployeePayload;
      await this.employeeService.registerEmployee(employeeData);
      return h.response({ message: 'Employee registered successfully' }).code(200);

    } catch (error) {
      return this.handleError(h, error);
    }
  }



  async loginEmployee(request: Request, h: ResponseToolkit) {
    try {
      const { email, password } = request.payload as LoginEmployeePayload;
      const employee = await this.employeeService.loginEmployee({ email, password });
      const role = employee.role
      const JWTToken = generateJWTToken(employee);
      console.log("new  JWT : ", JWTToken)
      h.state('userSession', { token: JWTToken });
      return h.response({ message: 'Login successful', role }).code(200);
    } catch (error) {
      if (error.message === "Invalid password" || error.message === 'Employee not found') {
        return h.response({ message: error.message }).code(400);
      }
      console.error('Login error:', error);
      return h.response({ message: "There is something wrong with backend" }).code(400);
    }
  }

  async authenticateEmployee(request: Request, h: ResponseToolkit) {
    try {
      const credentials = request.auth.credentials;
      const name = credentials.payload.name;
      const role = credentials.payload.role;
      const email = credentials.payload.email

      return h.response({
        name: name,
        email: email,
        role: role,
      }).code(200);
    } catch (error) {
      return this.handleError(h, error);
    }
  }


  async getAllEmployee(request: Request, h: ResponseToolkit) {
    try {
      const allEmployees = await this.employeeService.getAllEmployee();
      return h.response(allEmployees).code(200);
    } catch (error) {
      console.error('Get all employees error:', error);
      return h.response({ message: 'Failed to fetch employees' }).code(500);
    }
  }


  async getEmployeeByRole(request: Request, h: ResponseToolkit) {
    try {
      const credentials = request.auth.credentials;
      const role = credentials.payload.role.toLowerCase();
      const id = credentials.payload.id;

      if (role === 'manager' || role === 'hr_manager') {
        const getemployeeByRole = await this.employeeService.getEmployeeByRole(id, role);
        return h.response(getemployeeByRole).code(200);
      } else {
        return h.response({ message: 'Unauthorized user' }).code(403);
      }
    } catch (error) {
      console.error('Error in getEmployeeByRole:', error);
      return h.response({ message: 'Failed to fetch employees by role' }).code(500);
    }
  }

  async getAllManagers(request : Request,h: ResponseToolkit) {
    try {
      const allManagers = await this.employeeService.getAllManagers();
      return h.response(allManagers).code(200);
    } catch (e) {
      return h.response({ message: e }).code(400);
    }
  }

  async getAllHrManagers(h: ResponseToolkit) {
    try {
      const allHrManagers = await this.employeeService.getAllHrManagers();
      return h.response(allHrManagers).code(200);
    } catch (e) {
      return h.response({ message: e }).code(400);
    }
  }
}
