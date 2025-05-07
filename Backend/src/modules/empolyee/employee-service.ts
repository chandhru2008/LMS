import { Employee } from "./employee-model";
import { EmployeeRepository } from "./employee-repository";

export class EmployeeService{
    private employeeRepo : EmployeeRepository;

    constructor(employeeRepo : EmployeeRepository){
        this.employeeRepo = employeeRepo;
    }

    async registerEmployee(employeeData : Employee){

        try {
            const newEmployee = await this.employeeRepo.create(employeeData);
            return newEmployee;
          } catch (error) {
            console.error('Error creating employee:', error);
            throw new Error('Could not create employee');
          }
    }
}