import { dataSource } from "../../config/db/conn";
import { RegisterEmployeePayload } from "../../types";
import { LeaveBalanceService } from "../leave-balances/leave-balance-service";
import { Employee } from "./employee-entity";
import * as bcrypt from 'bcrypt';

export class EmployeeService {
  private repo = dataSource.getRepository(Employee);
  private leaveBalanceService: LeaveBalanceService

  constructor(leaveBalanceService: LeaveBalanceService) {
    this.leaveBalanceService = leaveBalanceService
  }

  // Find employee by email
  async findByEmail(email: string): Promise<Employee | null> {
    try {
      return await this.repo.findOne({ where: { email } });
    } catch (error) {
      throw new Error('Error retrieving employee data');
    }
  }

  // Create a new employee record with business validation
  async registerEmployee(employeeData: RegisterEmployeePayload): Promise<Employee> {
    try {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(employeeData.email)) {
        throw new Error("Enter a valid email");
      }

      const existingEmployee = await this.findByEmail(employeeData.email);
      if (existingEmployee) {
        throw new Error("Email already exists");
      }

      const role = employeeData.role.toLowerCase();

      // Supervisor emails 
      const managerEmail = employeeData.managerEmail?.trim();
      const hrManagerEmail = employeeData.hrManagerEmail?.trim();


      // Lookup supervisors
      const manager = managerEmail ? await this.findByEmail(managerEmail) : null;
      const hrManager = hrManagerEmail ? await this.findByEmail(hrManagerEmail) : null;


      // Validation based on role
      if (role === 'employee') {
        if (!manager) throw new Error("Manager does not exist");
      } else if (role === 'hr') {
        if (!hrManager) throw new Error("HR Manager does not exist");
      } else if (role === 'hr_manager' || role === 'director' || role === 'manager') {
        // No supervisor required
      } else {
        throw new Error("Invalid role");
      }

      // Create employee entity
      const employee = new Employee();
      employee.name = employeeData.name;
      employee.email = employeeData.email;
      employee.gender = employeeData.gender;
      employee.maritalStatus = employeeData.materialStatus;
      employee.password = await bcrypt.hash(employeeData.password, 10);
      employee.role = role;

      // Set supervisor relations
      if (role === 'employee') {
        employee.manager = manager!;
      } else if (role === 'hr') {
        employee.hrManager = hrManager!;
      }

      const newEmployee = await this.repo.save(employee);
      await this.leaveBalanceService.assignDefaultLeaveBalances(newEmployee)

      return newEmployee;


    } catch (e) {
      console.log("Error in EmployeeManager:", e);
      throw new Error(e.message);
    }
  }

  // Login employee
  async loginEmployee(loginEmployeeData: { email: string; password: string }): Promise<Employee> {
    try {
      const employee = await this.findByEmail(loginEmployeeData.email);

      if (!employee) {
        throw new Error('Employee not found');
      }

      const isPasswordValid = await bcrypt.compare(
        loginEmployeeData.password,
        employee.password
      );

      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      return employee;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getAllEmployee() {
    return await this.repo.find();
  }
  async getEmployeeByRole(id: string, role: string) {
    try {
      if (role === 'manager') {
        return await this.repo.find({ where: { manager: { id: id } } });
      } else if (role === 'hr_manager') {
        return await this.repo.find({ where: { hrManager: { id: id } } });
      }
    } catch (e) {
      console.log(e);
    }

  }
}
