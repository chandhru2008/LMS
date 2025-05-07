import { dataSource } from "../../config/db/conn";
import { Employee } from "./employee-model";

export class EmployeeRepository {
    private repo = dataSource.getRepository(Employee);

    // Finding the employee records using their email
    async findByEmail(email: string): Promise<Employee | null> {
        try {
            return await this.repo.findOne({
                where: { email },
            });
        } catch (error) {
            console.error('Error finding employee by email:', error);
            throw new Error('Error retrieving employee data');
        }
    }

    // Creating an employee record in the database
    async create(employeeData: Employee): Promise<Employee> {
        const employee = this.repo.create(employeeData); // Create a new employee instance
        return await this.repo.save(employee); // Save the employee to the database
    }
    
}
