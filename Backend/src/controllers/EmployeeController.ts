import { Request, ResponseToolkit } from '@hapi/hapi';
import * as EmployeeService from '../services/EmployeeServices';
import * as bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwtUtil'
import { EmployeeRepository } from '../Repository/employeeRepositary';


//Sign up logic 
export const createEmployee = async (request: Request, h: ResponseToolkit) => {
  try {
    const employeeData = request.payload as any;
    const newEmployee = await EmployeeService.createEmployee(employeeData);
    console.log(newEmployee);
    const token = generateToken(newEmployee);
    console.log(token);
    return h.response({ token }).code(201);
  } catch (error) {
    return h.response({ message: error.message }).code(400);
  }
};


//Login logic
export const authenticateEmployee = async (request: Request, h: ResponseToolkit) => {
  try {
    const { email, enteredPassword } = request.payload as { email: string; enteredPassword: string };

    const employeeRepo = new EmployeeRepository();

   const employee = await employeeRepo.findByEmail(email);

    //middleware
    if (!employee) {
      return h.response({ message: 'Email does not exit' }).code(401);
    }

    const actaulPassword = employee.password;

    const isMatch = await bcrypt.compare(enteredPassword, actaulPassword)

    if (!isMatch) {
      return h.response({ message: 'Invalid email or password' }).code(401);
    }

    // getting the data and and generate a jwt token 
    const payload = {
      name: employee.name,
      email: employee.email,
      role: employee.role,
    };

    const token = generateToken(payload);

    return h.response({ token }).code(200);

  } catch (e) {
    console.error('Authentication error:', e);
    return h.response({ message: 'Internal server error' }).code(500);
  }
};



