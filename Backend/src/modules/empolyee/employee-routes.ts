import { Server } from '@hapi/hapi';
import { EmployeeController } from './employee-controller';

export class EmployeeRoutes {
  private employeeController: EmployeeController;

  constructor(employeeController: EmployeeController) {
    this.employeeController = employeeController;
  }

  public employeeRoute(server: Server) {
    server.route([
      {
        method: 'POST',
        path: '/register',
        handler: async (request, h) => {
          console.log("POST /register route hit");
          return this.employeeController.registerEmployee(request, h);
        }
      },
      {
        method: 'POST',
        path: '/login',
        handler: (request, h) => {
          console.log("POST /login route hit");
          return this.employeeController.loginEmployee(request, h);
        }
      },
    ]);
  }
}
