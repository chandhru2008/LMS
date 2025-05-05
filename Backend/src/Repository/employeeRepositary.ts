import { dataSource } from "../config/db/conn";
import { Employee } from "../entity/Employee";

export class EmployeeRepository {

    private repo = dataSource.getRepository(Employee);


    //finding the employee records using their email
    async findByEmail(email: string): Promise<Employee | null> {
        return this.repo.findOne({ where: { email } });
      }

}