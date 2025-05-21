import { Employee } from "./employee-model";
import { EmployeeRepository } from "./employee-repository";
import * as bcrypt from 'bcrypt';

export class EmployeeService {
  private employeeRepo: EmployeeRepository;

  constructor(employeeRepo: EmployeeRepository) {
    this.employeeRepo = employeeRepo;
  }

  async registerEmployee(employeeData: any): Promise<Employee> {
    try {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(employeeData.email)) {
        throw new Error("Enter a valid email");
      }

      const existingEmployee = await this.employeeRepo.findByEmail(employeeData.email);
      if (existingEmployee) {
        throw new Error("Email already exists");
      }

      const role = employeeData.role.toLowerCase();

      // Supervisor emails from frontend
      const managerEmail = employeeData.managerEmail?.trim();
      const hrEmail = employeeData.hrEmail?.trim();
      const hrManagerEmail = employeeData.hrManagerEmail?.trim();
      const directorEmail = employeeData.directorEmail?.trim();

      // Lookup supervisors
      const manager = managerEmail ? await this.employeeRepo.findByEmail(managerEmail) : null;
      const hr = hrEmail ? await this.employeeRepo.findByEmail(hrEmail) : null;
      const hrManager = hrManagerEmail ? await this.employeeRepo.findByEmail(hrManagerEmail) : null;
      const director = directorEmail ? await this.employeeRepo.findByEmail(directorEmail) : null;

      // Validation based on the exact rules you gave
      if (role === 'employee') {
        if (!manager) throw new Error("Manager does not exist");
      } else if (role === 'manager') {
        if (!hr) throw new Error("HR does not exist");
      } else if (role === 'hr') {
        if (!hrManager) throw new Error("HR Manager does not exist");
      }else if(role === 'hr_manager')[
        //
      ]
       else if (role === 'director') {
        // No supervisor required
      } else {
        throw new Error("Invalid role");
      }

      // Create employee entity
      const employee = new Employee();
      employee.name = employeeData.name;
      employee.email = employeeData.email;
      employee.password = await bcrypt.hash(employeeData.password, 10);
      employee.role = role;

      // Set supervisor relations based on role
      if (role === 'employee') {
        employee.manager = manager!;
      } else if (role === 'manager') {
        employee.hr = hr!;
      } else if (role === 'hr') {
        employee.hrManager = hrManager!;
      }

      return await this.employeeRepo.create(employee);

    } catch (e: any) {
      console.log("Error in service : ", e )
      throw new Error(e.message);
    }
  }



  async loginEmployee(loginEmployeeData: { email: string; password: string }): Promise<Employee> {

    try {

      const checkEmployeeExist = await this.employeeRepo.findByEmail(loginEmployeeData.email);

      if (!checkEmployeeExist) {
        throw new Error('Employee not found');
      }

      const isPasswordValid = await bcrypt.compare(
        loginEmployeeData.password,
        checkEmployeeExist.password
      );

      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      return checkEmployeeExist;
    } catch (e: any) {
      throw new Error(e.message);
    }

  }
}
