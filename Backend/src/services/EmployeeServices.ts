import { Employee } from '../entity/Employee';
import { dataSource } from '../config/db/conn';
import { EmployeeRepository } from '../Repository/employeeRepositary';
import * as bcrypt from 'bcrypt';


export const createEmployee = async (data: any) => {

  //Getting the Table
  const employeeRepo = new EmployeeRepository();
  const employeeRepository = dataSource.getRepository(Employee);

  const newEmployee = new Employee();
  newEmployee.name = data.name;
  newEmployee.email = data.email;
  newEmployee.role = data.role;
  newEmployee.password = await bcrypt.hash(data.password, 10); // hasing the password for security purpose
  const manager = await employeeRepo.findByEmail(data.managerEmail);



  //if the role is employee
  if (data.role == "employee") {
    if (!manager) {
      throw new Error("Manager email does not exits");
    } else {
      newEmployee.manager = manager;
      console.log(manager);
    }
  }

  let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(data.email)) {
    throw new Error("Invalid Email address");
  }

  const employee = await employeeRepo.findByEmail(data.email); // getting employee details 

  // if the employee exit
  if (employee) {
    throw new Error('Email Already Exit');
  }

  //Saving the record in the table
  await employeeRepository.save(newEmployee);
  console.log(newEmployee);
  return newEmployee;
};

