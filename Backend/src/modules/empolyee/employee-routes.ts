import { Server } from '@hapi/hapi';
import { EmployeeController } from './employee-controller';
import { authenticate, authorizeRoles } from '../../middleware/auth-middleware';


export function employeeRoute(server: Server, employeeController: EmployeeController) {
  server.route([
    {
      method: 'POST',
      path: '/register',
      options: {
        pre: [{ method: authenticate },
        { method: authorizeRoles(['hr', 'hr_manager']) }
        ],
        handler: async (request, h) => {
          return await employeeController.registerEmployee(request, h);
        }
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
      options: {
        pre: [{ method: authenticate }],
        handler: (request, h) => {
          return employeeController.authenticateEmployee(request, h);
        }
      }
    },

    {
      method: 'GET',
      path: '/get-all-employees',
      options: {
        pre: [{ method: authenticate },
        { method: authorizeRoles(['hr', 'director']) }
        ],
        handler: (request, h) => {
          return employeeController.getAllEmployee(request, h);
        }
      }
    },

    {
      method: 'GET',
      path: '/get-employees-by-role',
      options: {
        pre: [{ method: authenticate },
        { method: authorizeRoles(['hr_manager', 'manager']) }
        ], // middleware
        handler: (request, h) => {
          return employeeController.getEmployeeByRole(request, h);
        }
      }
    }
  ]);
}
