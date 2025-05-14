import { Server } from '@hapi/hapi';
import { EmployeeController } from './employee-controller';
import { request } from 'http';

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
      {
        method: 'POST',
        path: '/log-out',
        handler: (request, h) => {
          return h
            .response({ message: 'Logged out successfully' })
            .unstate('userSession', { path: '/' });
        }
      },
      {
        method : 'GET',
        path : '/check-auth',
        handler: (request, h) => {
       return this.employeeController.authenticateEmployee(request, h);
        }
      },
    ]);
  }
}
