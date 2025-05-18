import { Employee } from "./employee-model";
import { EmployeeRepository } from "./employee-repository";
import * as bcrypt from 'bcrypt';

export class EmployeeService {
  private employeeRepo: EmployeeRepository;

  constructor(employeeRepo: EmployeeRepository) {
    this.employeeRepo = employeeRepo;
  }

  async registerEmployee(employeeData: any): Promise<Employee> {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(employeeData.email)) {
      throw new Error("Enter a valid email");
    }

    const existingEmployee = await this.employeeRepo.findByEmail(employeeData.email);
    if (existingEmployee) {
      throw new Error("Email already exists");
    }

    const role = employeeData.role.toLowerCase();


    const managerEmail = employeeData.managerEmail?.trim();
    const hrEmail = employeeData.hrEmail?.trim();
    const directorEmail = employeeData.directorEmail?.trim();


    console.log('Looking up emails:', { managerEmail, hrEmail, directorEmail });

    // Lookup supervisors
    const [manager, hr, director] = await Promise.all([
      managerEmail ? this.employeeRepo.findByEmail(managerEmail) : null,
      hrEmail ? this.employeeRepo.findByEmail(hrEmail) : null,
      directorEmail ? this.employeeRepo.findByEmail(directorEmail) : null
    ]);

    console.log(managerEmail);
    console.log(directorEmail);

    // Validation based on role
    if (role === 'employee') {
      if (!manager) throw new Error("Manager does not exist");
      if (!hr) throw new Error("HR does not exist");
      if (!director) throw new Error("Director does not exist");
    }

    if (role === 'manager') {
      if (!hr) throw new Error("HR does not exist");
      if (!director) throw new Error("Director does not exist");
    }

    if (role === 'hr') {
      if (!manager) throw new Error("Manager does not exist");
      if (!director) throw new Error("Director does not exist");
    }

    // Create and populate employee entity
    const employee = new Employee();
    employee.name = employeeData.name;
    employee.email = employeeData.email;
    employee.password = await bcrypt.hash(employeeData.password, 10);
    employee.role = role;

    // Set supervisor references
    if (manager) employee.manager = manager;
    if (hr) employee.HR = hr;
    if (director) employee.director = director;

    return await this.employeeRepo.create(employee);
  }

  async loginEmployee(loginEmployeeData: any): Promise<Employee> {
    console.log(loginEmployeeData)
    const checkEmployeeExist = await this.employeeRepo.findByEmail(loginEmployeeData.email);

    if (!checkEmployeeExist) {
      throw new Error('Employee not found');
    }

    console.log(loginEmployeeData.userData)
    const isPasswordValid = await bcrypt.compare(
      loginEmployeeData.password,
      checkEmployeeExist.password
    );

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    console.log(checkEmployeeExist);
    return checkEmployeeExist;
  }
}
