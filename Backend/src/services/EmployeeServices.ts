import { Employee } from '../entity/Employee';
import { dataSource } from '../config/db/conn';
import { EmployeeRepository } from '../Repository/employeeRepositary';
import * as bcrypt from 'bcrypt';


export const createEmployee = async (data: any) => {

  //Getting the Table
  const employeeRepository = dataSource.getRepository(Employee);

  const newEmployee = new Employee();
  newEmployee.name = data.name;
  newEmployee.email = data.email;
  newEmployee.password =  await bcrypt.hash(data.password, 10); // hasing the password for security purpose
  newEmployee.role = data.role;


  let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(data.email)) {
    throw new Error("Invalid Email address");
  }

  const validRole = ['Director', 'HR', 'Manager', 'Employee'];
  if (!validRole.includes(data.role)) {
    throw new Error('Enter a valid Role');
  }

 
  const employeeRepo = new EmployeeRepository()
  const employee = await employeeRepo.findByEmail(data.email); // getting employee details 

  // if the employee exit they can not do sign up
  if (employee) {
    throw new Error('Email Already Exit');
  }

  //Saving the record in the table
  await employeeRepository.save(newEmployee);
  return newEmployee;
};

