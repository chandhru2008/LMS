import { Request, ResponseToolkit } from "@hapi/hapi";
import { EmployeeService } from "./employee-service";
import { generateJWTToken, verifyToken } from "../../utils/jwtUtil";
import { LeaveBalanceController } from "../leave-balances/leave-balance-controller";
const jwt = require('jsonwebtoken');

export class EmployeeController {
  private employeeService: EmployeeService;
  private leaveBalanceController: LeaveBalanceController;

  constructor(employeeService: EmployeeService, leaveBalanceController: LeaveBalanceController) {
    this.employeeService = employeeService;
    this.leaveBalanceController = leaveBalanceController;
  }

  async registerEmployee(request: Request, h: ResponseToolkit) {
    try {
      // const secretKey = process.env.JWT_SECRET
      // const JWTtoken = request.state.userSession.token;
      // const decode = jwt.verify(JWTtoken, secretKey);
      // const role = decode.payload.role;


      // if(role != 'HR'){
      //   return h.response({message : 'Unauthorized user'}).code(401);
      // }
      
      const employeeData = request.payload as any;
      const newEmployee = await this.employeeService.registerEmployee(employeeData);
      await this.leaveBalanceController.assignDefaultLeaveBalances(newEmployee);

      return h.response({
        message: 'Employee registered successfully',
      }).code(200);

    } catch (e : any) {
      console.log("Error in controller : ", e )
      return h.response({ message:  e.message }).code(400);
    }
  }


  //Login 
  async loginEmployee(request: Request, h: ResponseToolkit) {
    try {
      const loginEmployeeData = request.payload as { email: string, password: string };
      const employee = await this.employeeService.loginEmployee(loginEmployeeData);
      const JWTToken = generateJWTToken(employee);
      h.state('userSession', { token: JWTToken });
      return h.response({
        message: 'Login successful',
        JWTToken,
      }).code(200);
    } catch (e: any) {
      if (e.message === "Invalid password" || e.message === 'Employee not found') {
        return h.response({ message: e.message }).code(400);
      } else {
        console.log(e.message);
        return h.response({ message: "There is somethink issue with backend" }).code(400);
      }
    }
  }



  async authenticateEmployee(request: Request, h: ResponseToolkit) {
    try {
      const token = request.state.userSession.token;
      if (!token) {
        return h.response({ message: 'JWT token must be provided- token' }).code(400);
      }

      const varifyEmployee = verifyToken(token);

      return h.response(
        {
          employeeName: varifyEmployee.payload.name,
          role: varifyEmployee.payload.role
        }
      ).code(200);

    } catch (e: any) {
      if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
        return h.response({ message: 'Invalid or expired token' }).code(401);
      }
      return h.response({ message: 'Internal server error', error: e }).code(500);
    }
  }

}
