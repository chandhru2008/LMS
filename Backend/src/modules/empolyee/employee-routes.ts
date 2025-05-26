import { Server } from '@hapi/hapi';
import { EmployeeController } from './employee-controller';

export function employeeRoute(server: Server, employeeController: EmployeeController) {
  server.route([
    {
      method: 'POST',
      path: '/register',
      handler: async (request, h) => {
        return await employeeController.registerEmployee(request, h);
      }
    },

    {
      method: 'POST',
      path: '/login',
      handler: async (request, h) => {
        return await employeeController.loginEmployee(request, h);
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
      method: 'GET',
      path: '/check-auth',
      handler: (request, h) => {
        return employeeController.authenticateEmployee(request, h);
      }
    },
    {
      method: 'GET',
      path: '/get-all-employees',
        handler: (request, h) => {
        return employeeController.getAllEmployee(request, h);
      }
    }, {
      method : 'GET',
      path : '/get-employees-by-role',
      handler : (request, h) => {
        console.log('routes hit')
        return employeeController.getEmployeeByRole(request, h);
      }
    }

  ]);
}
